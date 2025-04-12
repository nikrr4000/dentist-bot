import apptCtrl from "#db/handlers/apptCtrl.js";
import recordsCtrl from "#db/handlers/recordsCtrl.js";
import { apptsKServices, createRecordKs, createRecordTexts } from "#helpers/index.js";
import { addBackButton } from "#helpers/keyboardUtils.js";
import { backButton } from "#keyboards/generalKeyboards.js";
import type { MyContext, MyConversation } from "#types/grammy.types.js";
import type { basicCallbackArgs } from "#types/shared.types.js";
import type { InlineKeyboard } from "grammy";
import { settingsUnit } from "./settingsUnit.js";
import dates from "#helpers/dates.js";
import { waitingListUnit } from "./waitingListUnit.js";


const genUnit = (ctx: MyContext, ...args: basicCallbackArgs) => ({
	adminMode: args[0] === 'admin',
	pathId: args[1],
	userId: args[2],
	async showApptMenu() {
		let text: string
		let k: InlineKeyboard

		const path = this.adminMode ? 'appt' : 'record'
		const action = this.adminMode ? 'check' : 'create'

		const appts = await apptCtrl.findFutureAppts()

		if (!appts || appts.length === 0)
		{
			text = 'На данный момент нет открытых записей.'
			k = backButton
		} else
		{
			text = "На данный момент открыт прием на следующие даты:";
			const basicK = await apptsKServices.createBasicKeyboard(
				path,
				action,
				this.adminMode,
				{ userId: ctx.userId },
			);
			k = addBackButton(basicK)
		}

		ctx.editMessageText(text, { reply_markup: k });
	},
	showWaitingListMenu: async () => waitingListUnit(ctx, ...args).showMenu(),
	async showSchedule() {
		const userId = ctx.userId

		const records = await recordsCtrl.findFutureRecords({ userId })

		let text = 'На данный момент вы записаны на следующие приемы:\n\n'
		text += records.map(record => {
			const apptDate = dates.parseApptDate(record.Appointment.start)
			const apptDateDay = dates.getStrDateWithoutTime(apptDate)
			const parsedDateAndCutDate = (date: Date) => dates.getStrDateWithoutDate(dates.parseApptDate(date))
			const slotInterval = `${parsedDateAndCutDate(record.start)} - ${parsedDateAndCutDate(record.end)}`

			return createRecordTexts.basicText(record.Appointment.place, apptDateDay, record.Procedure.name, slotInterval)
		}).join('\n\n')

		const k = createRecordKs.basic(records, false).row().text('Назад', 'back')

		await ctx.editMessageText(text, { reply_markup: k })
	},
	showSettings: () => settingsUnit(ctx, ...args).showSettings()
});

export { genUnit }