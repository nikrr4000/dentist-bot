import logger from "#root/logger.js";
import type { MyContext, MyConversation } from "#types/grammy.types.js";
import sendAdminMenu from "#serviceMessages/sendAdminMenu.js";
import { menuDenyConfirmK } from "#keyboards/generalKeyboards.js";
import { handleMenuDenyConfirmKAnswer } from "#helpers/keyboardUtils.js";
import type { AppointmentCreationT } from "#db/models/Appointments.js";
import dates from "#helpers/dates.js";
import apptCtrl from "#db/handlers/apptCtrl.js";
import logErrorAndThrow from "#handlers/logErrorAndThrow.js";
import { adminMenu } from "#keyboards/index.js";
import unlessActions from "./helpers/unlessActions.js";

type apptInfoGatheringT = {
	[key: string]: string;
	date: string;
	start: string;
	end: string;
	place: string;
};

export async function createAppt(conversation: MyConversation, ctx: MyContext) {
	await ctx.deleteMessage()
	const h = apptHs(ctx, conversation);
	try
	{
		await h.gatherInfo();

		const answer = await h.infoCheck();
		const approved = handleMenuDenyConfirmKAnswer(answer);
		approved ? h.trueAnswerHandler() : h.falseAnswerHandler();
	} catch (err)
	{
		const error = err as Error;
		logger.error(error.message);
	}
}

const apptHs = (ctx: MyContext, conversation: MyConversation) => ({
	dataForEdit: {
		chatId: 0,
		message_id: 0,
	},
	questions: {
		date: "Напишите дату, когда будет открыта запись в следующем формате\n<i><b>24.10.24</b></i>",
		start:
			"Напишите время начала приема. Время должно быть округлено.\nНапример: \n9:00 - ok, 9:10 - not\n18:30 - ok, 18 - not",
		end: "Напишите время окончания приема\nНапример: \n9:00 - ok, 9:10 - not\n18:30 - ok, 18 - not",
		place: "Напишите место, где будет открыта запись.",
	} as apptInfoGatheringT,
	answers: {} as apptInfoGatheringT,
	async gatherInfo() {
		for await (const _ of gatherApptInfoT(
			conversation,
			ctx,
			this.questions,
			this.answers,
		))
		{
		}
	},
	async infoCheck() {
		const ans = this.answers;
		let text = "Проверьте корректность введенных данных:\n\n";
		text += `Место приема: ${ans.place}\n`;
		text += `Дата: ${ans.date}\n`;
		text += `Время начала: ${ans.start}\n`;
		text += `Время окончания: ${ans.end}`;
		const k = menuDenyConfirmK();

		const msgData = await ctx.reply(text, { reply_markup: k, parse_mode: "HTML" });

		this.dataForEdit = {
			chatId: msgData.chat.id,
			message_id: msgData.message_id
		}

		return await conversation.waitForCallbackQuery(/./);
	},
	async trueAnswerHandler() {
		const dbObj = dbPrepareApptObj(this.answers);
		try
		{
			const result = await apptCtrl.create(dbObj);

			if (result.status === "ok")
			{
				this.sendSuccessMessage();
				return;
			}
			throw new Error(result.details);
		} catch (err)
		{
			logErrorAndThrow(err, "error", "error trying to create an appointment");
		}
	},
	sendSuccessMessage() {
		const { chatId, message_id } = this.dataForEdit

		ctx.api.editMessageText(chatId, message_id, "Запись успешно открыта", { reply_markup: adminMenu.menu });
	},
	falseAnswerHandler: async () => {
		await sendAdminMenu(ctx);
		return;
	},
});

const dbPrepareApptObj = (apptObj: apptInfoGatheringT) => {
	const startDateStr = `${apptObj.date}, ${apptObj.start}`;
	const endDateStr = `${apptObj.date}, ${apptObj.end}`;

	return {
		place: apptObj.place,
		start: dates.apptDateFromString(startDateStr),
		end: dates.apptDateFromString(endDateStr),
	} as AppointmentCreationT;
};

const gatherApptInfoT = async function* (
	conversation: MyConversation,
	ctx: MyContext,
	textObjs: apptInfoGatheringT,
	acc: apptInfoGatheringT,
) {
	try
	{
		const entries = Object.entries(textObjs);
		for (const e of entries)
		{
			const [key, question] = e;
			await ctx.reply(question, { parse_mode: "HTML", reply_markup: adminMenu.menu });
			const messageObj = await conversation.waitFor(":text", {
				otherwise: (ctx) => unlessActions(ctx, () => ctx.reply('Используйте текст'))
			});
			const messageText = messageObj.message?.text;

			if (messageText)
			{
				acc[key] = messageText;
				yield;
			} else
			{
				throw new Error("empty message inside generateMeetingsQs generator");
			}
		}
	} catch (err)
	{
		const error = err as Error;
		logger.error(error.message);
		await ctx.reply(
			"Произошла ошибка во время создания встречи. Зайдите позже",
		);
		return;
	}
};
