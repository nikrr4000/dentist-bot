import apptCtrl from "#db/handlers/apptCtrl.js";
import apptSlotsCtrl from "#db/handlers/apptSlotsCtrl.js";
import type { AppointmentT } from "#db/models/Appointments.js";
import type { ApptSlotsT } from "#db/models/ApptSlots.js";
import { InlineKeyboard } from "grammy";
import dates from "./dates.js";
import { constructDefaultButtonsData, keyboardFromData } from "./keyboardUtils.js";
import recordsCtrl from "#db/handlers/recordsCtrl.js";
import { createRecordTexts } from "./recordsUtils.js";
import { sequelize } from "#db/dbClient.js";
import notificator from "./notificator.js";
import { mainMenu } from "#keyboards/generalKeyboards.js";
import type { Message } from "grammy/types";
import { guardExp } from "./index.js";

const apptsServices = {
	futureAppts() {
		return apptCtrl.findFutureAppts();
	},
	getTomorrowAppts() {
		return apptCtrl.findTomorrowAppt();
	},
	async getAvailableAppts(isAdmin: boolean) {
		const apptsList = await this.futureAppts();
		guardExp(apptsList, "apptsList inside getAvailableAppts");
		if (apptsList.length === 0 || !isAdmin) return apptsList;

		const slotsPromises = apptsList.map(async (appt) => {
			const slots = await apptSlotsCtrl.getSlots({ apptId: appt.id });
			return [appt, slots] as [AppointmentT, ApptSlotsT[]];
		});
		const apptsSlotsArr = await Promise.all(slotsPromises);

		return apptsSlotsArr
			.filter((el) => {
				const [_, value] = el;
				return value.length !== 0;
			})
			.map((el) => el[0]);
	},
	getApptDateText: (appt: Omit<AppointmentT, "id" | "ended">) => {
		const dateStr = dates.parseApptDate(appt.start)
		return dates.getStrDateWithoutTime(dateStr)
	},
	createApptInfo: (appt: Omit<AppointmentT, "id" | "ended">) => {
		const dateStart = dates.parseApptDate(appt.start)
		const dateEnd = dates.parseApptDate(appt.end)

		const dateStr = dates.getStrDateWithoutTime(dateStart)
		const startStr = dates.getStrDateWithoutDate(dateStart)
		const endStr = dates.getStrDateWithoutDate(dateEnd)

		let text = `Место приема: ${appt.place}\n`;
		text += `Дата: ${dateStr}\n`;
		text += `Время начала: ${startStr}\n`;
		text += `Время окончания: ${endStr}\n`;

		return text
	},
	notificateAboutCancel: async (dataMap: Map<number, string>) => {
		const baseText = 'Ваши записи:\n\n'
		const notifResultsPromises = [] as Promise<Message.TextMessage>[]
		dataMap.forEach((value, key) => {
			const infoText = `${baseText}${value}\nбыла отменена так как прием был закрыт.`
			const notifRes = notificator.sendMessageById(infoText, key, mainMenu.menu)
			notifResultsPromises.push(notifRes)
		})
		// TODO: count all success notifs
		// const notifResults = await Promise.all(notifResultsPromises)
	},
	async cancelAppt(apptId: number) {
		const transaction = await sequelize.transaction()
		try
		{
			const records = await recordsCtrl.findFutureRecords({ apptId })

			const userNotifsLoad = records.reduce((acc: Map<number, string>, record) => {
				const text = createRecordTexts.recordInfo(record)
				const existingKey = acc.get(record.userId)
				if (existingKey)
				{
					return acc.set(record.userId, `${existingKey}${text}`)
				}
				return acc.set(record.userId, text)
			}, new Map<number, string>())

			const deleteRes = await apptCtrl.destroy({ id: apptId }, transaction)

			if (deleteRes === 0) throw new Error()

			await transaction.commit()
			//FIXME: Add check if all users got notif
			await this.notificateAboutCancel(userNotifsLoad)
			return true
		} catch (error)
		{
			transaction.rollback()
			return false
		}

	}
};

interface CreateBasicKeyboardOptionalParams {
	userId?: number;
	appts?: AppointmentT[];
}

const apptsKServices = {
	getTextButtons: (appts: AppointmentT[]) =>
		appts.map(apptsServices.getApptDateText),
	async createBasicKeyboard(path: string, action: string, adminMode: boolean, optionalParams?: CreateBasicKeyboardOptionalParams) {
		let { userId, appts } = optionalParams || {};
		const mode = adminMode ? "admin" : "user";
		if (!appts)
		{
			appts = await apptsServices.getAvailableAppts(adminMode);
		}

		const kTexts = appts.flatMap((el) => this.getTextButtons([el]));
		const keyboardDataStructures = appts.map(appt => ({ path, action, mode, pathId: appt.id, userId }))

		const keyboardData = constructDefaultButtonsData(kTexts, keyboardDataStructures);

		return keyboardFromData(keyboardData);
	},
	getApptActions: (appt: AppointmentT) => {
		const k = new InlineKeyboard()
			.text('Отменить прием', `appt_cancel_admin__${appt.id}`)
			.row()

		return k.text('Назад', 'back')
	},
};


export { apptsServices, apptsKServices };
