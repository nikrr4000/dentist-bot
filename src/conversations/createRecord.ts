import { sequelize } from "#db/dbClient.js";
import apptCtrl from "#db/handlers/apptCtrl.js";
import apptSlotsCtrl from "#db/handlers/apptSlotsCtrl.js";
import recordsCtrl from "#db/handlers/recordsCtrl.js";
import type { ApptSlotsCreationT, ApptSlotsT } from "#db/models/ApptSlots.js";
import type { RecordCreationT } from "#db/models/Records.js";
import { manageApptSlots, manageApptSlotsK } from "#helpers/apptSlotsUtils.js";
import { apptsServices } from "#helpers/apptUtils.js";
import guardExp from "#helpers/guardExp.js";
import { addMainMenuButton, handleMenuDenyConfirmKAnswer } from "#helpers/keyboardUtils.js";
import { proceduresInfoManager, proceduresKManager } from "#helpers/proceduresUtils.js";
import { createRecordTexts } from "#helpers/recordsUtils.js";
import { mainMenu, menuDenyConfirmK } from "#keyboards/generalKeyboards.js";
import startHandler from "#serviceMessages/startHandler.js";
import type { MyContext, MyConversation } from "#types/grammy.types.js";
import type { Transaction } from "sequelize";
import unlessActions from "./helpers/unlessActions.js";
import logger from "#root/logger.js";
import Users from "#db/models/Users.js";
import notificator from "#helpers/notificator.js";
import dates from "#helpers/dates.js";

type recordInfoGatheringT = {
	procedureId: string;
	interval: string;
	nointerval: string;
	check: string;
	success: string;
	error: string;
};

export async function createRecord(
	conversation: MyConversation,
	ctx: MyContext,
) {
	const h = recordH(ctx, conversation);
	const userId = ctx.userId
	try
	{
		const apptId = h.apptId;

		const [procedureName, procedureId] = await h.getProcedureId();

		const [intervalLabel, intervalIds] = await h.getInterval(apptId, procedureId);
		if (!intervalLabel || !intervalIds) return

		const checkText = await h.createRecordCheckText(apptId, procedureName, intervalLabel)
		const answer = await h.checkRecordInfo(ctx, conversation, checkText)
		const approved = handleMenuDenyConfirmKAnswer(answer);

		if (!approved)
		{
			return h.falseAnswerHandler()
		}

		const dbSaveRes = await h.trueAnswerHandler({
			apptId,
			userId,
			procedureId,
		}, intervalIds)
		h.displayRegResult(dbSaveRes)
		h.sendInfoMessage(userId, apptId, intervalLabel, procedureName)
	} catch (error)
	{
		h.errorHandler(error as Error, userId)
	}
}

const recordH = (ctx: MyContext, conversation: MyConversation) => ({
	texts: {
		procedureId: "Выберите подходящую процедуру:\n",
		interval: "Выберите подходящее время.",
		nointerval: 'Свободных записей на данную процедуру не осталось.',
		check: "Подтвердите правильность созданной записи:",
		success: "Вы успешно записаны на прием.",
		error: "Произошла ошибка при попытке зарегистрировать вашу запись. Зайдите позже."
	} as recordInfoGatheringT,
	apptId: ctx.session.temp.apptNumber,
	async getProcedureId() {
		const k = await proceduresKManager.getList();
		const descriptions = await proceduresInfoManager.getProceduresDescrList()
		const t = `${this.texts.procedureId}${descriptions}`
		await ctx.editMessageText(t, { reply_markup: k, parse_mode: 'HTML' });

		const { callbackQuery: { data } } = await conversation.waitForCallbackQuery(/.+/);
		const [label, id] = data.split("__")

		return [label, Number(id)] as [string, number];
	},
	async getInterval(apptId: number, procedureId: number) {
		const slotsManager = manageApptSlots(apptId)
		const textWithIdMap = await slotsManager.getApptSlotsTextWithId(procedureId);

		const mapSize = textWithIdMap.size

		const k = mapSize === 0 ? mainMenu.menu : manageApptSlotsK.createButtons(textWithIdMap);
		const text = mapSize === 0 ? this.texts.nointerval : this.texts.interval;

		await ctx.editMessageText(text, { reply_markup: k });
		if (mapSize === 0) return []
		// TODO: test if message is label
		const { callbackQuery: { data } } = await conversation.waitForCallbackQuery(/.+/, { otherwise: ctx => unlessActions(ctx, startHandler) })

		const [label, idsStr] = data.split('__')
		const ids = idsStr.split('_').map(Number)

		return [label, ids] as [string, number[]]
	},
	async createRecordCheckText(apptId: number, procedureName: string, slotInterval: string) {
		const appt = await apptCtrl.findOne({ id: apptId })
		guardExp(appt, 'appt inside checkRecordInfo')
		const date = apptsServices.getApptDateText(appt)
		const place = appt.place

		const text = `${this.texts.check}\n\n${createRecordTexts.basicText(place, date, procedureName, slotInterval)}`
		return text
	},
	async checkRecordInfo(ctx: MyContext, conversation: MyConversation, text: string) {
		await ctx.editMessageText(text, { reply_markup: menuDenyConfirmK() })
		return conversation.waitForCallbackQuery(/./);
	},
	async trueAnswerHandler(recordObj: {
		apptId: number,
		userId: number,
		procedureId: number,
	}, slotsBordersIds: number[]) {
		const h = dbManageH
		const transaction = await sequelize.transaction()
		try
		{
			const borderSlotsObjs = await h.getBorderSlotsByIds(slotsBordersIds)

			const [start, end] = borderSlotsObjs.map(el => el.time).sort((a, b) => a.getTime() - b.getTime())

			const recordSaveRes = await h.saveRecordToDb({ ...recordObj, start, end }, transaction)
			const slotsUpdateRes = await h.updateSlots(recordSaveRes.id, [start, end], transaction)
			await h.createBorderSlots(borderSlotsObjs, transaction)

			if (recordSaveRes && Array.isArray(slotsUpdateRes))
			{
				transaction.commit()
				return true
			}
			throw new Error
		} catch (error)
		{
			logger.error(error as string);

			transaction.rollback()
			return false
		}
	},
	falseAnswerHandler: () => { startHandler(ctx) },
	displayRegResult(result: boolean) {
		result ?
			ctx.editMessageText(this.texts.success, { reply_markup: mainMenu.menu }) :
			() => {
				ctx.editMessageText(this.texts.error, { reply_markup: mainMenu.menu })
				throw new Error()
			}
	},
	async sendInfoMessage(userId: number, apptId: number, recordInterval: string, procedureName: string) {
		const user = await dbManageH.findUser(userId)
		const appt = await dbManageH.findAppt(apptId)
		const apptDate = appt ? dates.getStrDateWithoutTime(dates.parseApptDate(appt.start)) : 'Проблема с отображением даты приёма'

		let text = 'Была создана новая запись:\n'
		text += `Приём: ${apptDate}\n`
		text += `Время: ${recordInterval}\n`
		text += `Процедура: ${procedureName}\n`
		text += `Имя: ${user?.firstName} ${user?.secondName}\n`
		text += `username: @${user?.username || 'username скрыт или не был найден'}`

		notificator.sendInfoMsg('record', text)
	},
	async errorHandler(error: Error, userId: number) {
		const user = await dbManageH.findUser(userId)

		let text = 'Ошибка при попытке создать запись\n'
		text += `Id: ${userId}\n`
		text += `username: @${user?.username || 'username скрыл или не найден'}\n`
		text += `Имя: ${user?.firstName} ${user?.secondName}`

		notificator.sendInfoMsg('record', text)
		text += `\n${error}`
		notificator.sendInfoMsg('error', text)
	}
});

const dbManageH = {
	saveRecordToDb: (recordObj: RecordCreationT, transaction: Transaction) => {
		return recordsCtrl.create(recordObj, transaction)
	},
	createSlotIdsArr: (ids: number[]) => {
		const idsArr: number[] = []
		const sortedIds = ids.sort((a, b) => a - b)

		for (let i = sortedIds[0]; i <= sortedIds[1]; i++)
		{
			idsArr.push(i)
		}

		return idsArr
	},
	getBorderSlotsByIds: (ids: number[]) => apptSlotsCtrl.getSlotsById(ids),
	async createBorderSlots(borderSlotsObjs: ApptSlotsT[], transaction: Transaction) {
		const apptId = borderSlotsObjs[0].apptId
		const createQuery = (time: Date) => ({ apptId, time, recordId: 0 })
		const findFunc = apptSlotsCtrl.getFindFunc()
		// Create new slots
		const newSlots: ApptSlotsCreationT[] = borderSlotsObjs.map(el => ({ apptId: el.apptId, time: el.time }))
		// Check if each slot is necessarty
		//// Check if slots with new timestamps exist
		const newSlotsTimestamps = newSlots.map(slot => slot.time)
		const newTimestampsExistPromises = newSlotsTimestamps.map(async date => {
			const foundSlots = await findFunc.findOne({ where: createQuery(date) })
			if (foundSlots) return true
			return false
		})
		const newTimestampsExist = await Promise.all(newTimestampsExistPromises)
		//// Create neigbour timestmaps
		const neighbourIntervals: Date[][] = newSlots.map(slot => {
			const d1 = slot.time.setMinutes(slot.time.getMinutes() - 15)
			const d2 = slot.time.setMinutes(slot.time.getMinutes() + 15)
			return [new Date(d1), new Date(d2)]
		})
		//// Check if neigbour slots exist
		const neigboursExistArrayPromises = neighbourIntervals.map(async dates => {
			const foundSlotsPromises = dates.map(time => findFunc.findOne({ where: createQuery(time) }))
			const foundSlots = await Promise.all(foundSlotsPromises)
			if (foundSlots && foundSlots.length > 0) return true
			return false
		})
		const neigboursExist = await Promise.all(neigboursExistArrayPromises)

		const createPromises = []
		for (let i = 0; i < newTimestampsExist.length; i++)
		{
			const arr1 = newTimestampsExist
			const arr2 = neigboursExist

			if (arr1[i] && arr2[i])
			{
				const promise = apptSlotsCtrl.create.one(newSlots[i], transaction)
				createPromises.push(promise)
			}
		}

		return Promise.all(createPromises)
	},
	updateSlots: (recordId: number, timeInterval: [Date, Date], transaction: Transaction) => apptSlotsCtrl.bulkUpdateRecordIdByIntervalBorders({ recordId }, timeInterval, transaction),
	findUser: (userId: number) => Users.findOne({ where: { userId } }),
	findAppt: (id: number) => apptCtrl.findOne({ id })
}
