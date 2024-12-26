import { Api, Bot, GrammyError, HttpError, session } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import sessionConfig from "#root/botConfig/sessionConfig.js";
import logger from "#root/logger.js";
import { sequelize } from "#db/dbClient.js";
import type { MyContext } from "#types/grammy.types.js";
import ctxExtender from "#middleware/ctxExtender.js";
import traceRoutes from "#middleware/traceRoutes.js";
import startHandler from "#serviceMessages/startHandler.js";
import handleBackButton from "#handlers/handleBackButton.js";
import { hydrateFiles } from "@grammyjs/files";
import sanitizedConfig from "./config.js";
import logErrorAndThrow from "#handlers/logErrorAndThrow.js";
import { mainMenu } from "#keyboards/generalKeyboards.js";
import { createAppt } from "#conv/createAppt.js";
import userReg from "#conv/userReg.js";
import sendAdminMenu from "#serviceMessages/sendAdminMenu.js";
import { keyboard } from "#handlers/buttonRouters.js";
import { createRecord } from "#conv/createRecord.js";
import ApptSlots from "#db/models/ApptSlots.js";
import Appointments from "#db/models/Appointments.js";
import Records from "#db/models/Records.js";

(async () => {
	await sequelize.sync({ alter: true });
	logger.info("Database synced");
})();

const token = sanitizedConfig.BOT_API_TOKEN;
if (!token)
{
	throw new Error("There is no bot token");
}
export const bot = new Bot<MyContext>(token);
bot.api.config.use(hydrateFiles(token));
export const admin = new Api(token);

bot.use(
	session({
		initial: () => structuredClone(sessionConfig),
	}),
);
bot.use(conversations());
bot.use(createConversation(userReg));
bot.use(createConversation(createAppt));
bot.use(createConversation(createRecord));
bot.use(ctxExtender);
bot.use(traceRoutes);
bot.use(keyboard);

bot.command("admin", async (ctx) => {
	try
	{
		await sendAdminMenu(ctx);
	} catch (err)
	{
		logErrorAndThrow(err, "fatal", "unable to send sendAdminMenu");
	}
});

bot.command('apptsclear', async (ctx) => {
	await Records.truncate({ cascade: true })
	await ApptSlots.truncate({ cascade: true })
	await Appointments.truncate({ cascade: true })
	await ctx.reply('Все записи удалены')
	startHandler(ctx)
})

bot.command('recordsclear', async (ctx) => {
	const { userId } = ctx
	const record = await Records.findOne({ where: { userId } })
	if (!record)
	{
		return ctx.reply('нет существующих записей на этот id')
	}
	await Records.destroy({ where: { userId } })
	await ApptSlots.update({ recordId: 0 }, { where: { recordId: record.id } })
	await ctx.reply('Информация о записях стерта')
	startHandler(ctx)
})

bot.command("start", async (ctx: MyContext) => {
	try
	{
		await startHandler(ctx);
	} catch (err)
	{
		logErrorAndThrow(err, "fatal", "unable to send startMessage");
	}
});

bot.callbackQuery("back", async (ctx: MyContext) => {
	try
	{
		await handleBackButton(ctx);
	} catch (err)
	{
		logErrorAndThrow(err, "fatal", "unable to hange handleBackButton");
	}
});

bot.catch((err) => {
	const ctx = err.ctx;
	logger.fatal(`Error while handling update ${ctx.update.update_id}:`);
	const e = err.error;
	if (e instanceof GrammyError)
	{
		logger.fatal(`Error in request:\n${e}`);
	} else if (e instanceof HttpError)
	{
		logger.fatal(`Could not contact Telegram:\n${e}`);
	} else
	{
		logger.fatal(`Unknown error:\n${e}`);
	}
	ctx.reply("На данный момент бот на покое.", { reply_markup: mainMenu.menu });
});

bot.start();
