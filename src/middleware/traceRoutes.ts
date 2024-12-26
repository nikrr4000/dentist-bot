import { guardExp } from "#helpers/index.js";
import startHandler from "#serviceMessages/startHandler.js";
import type { NextFunction } from "grammy";
import type { CallbackCtx } from "#types/grammy.types.js";
import type { MyContext } from "#types/grammy.types.js";
import sanitizedConfig from "#root/config.js";
import ApptSlots from "#db/models/ApptSlots.js";

export default async function (ctx: MyContext, next: NextFunction) {
	const adminIds = sanitizedConfig.ADMIN_IDS.split("|").map(Number);
	const messObj = ctx.message;

	const cbMessageId = ctx?.callbackQuery?.message?.message_id;
	const updateMessageId = ctx?.update?.message?.message_id;

	const currentMsgId: number | undefined = cbMessageId ?? updateMessageId;
	guardExp(currentMsgId, "traceRoutes error, currentMsgId");

	const lastMsgId = ctx.session.lastMsgId ?? 0;
	const messText = ctx.message?.text || "fillme";
	const isTopic = messObj?.is_topic_message;
	const isSupergroup = messObj?.chat.type === "supergroup";
	const adminCommands = ["/admin", "/init"];
	const isAdminCommand = adminCommands.includes(messText);

	if (
		isTopic ||
		(ctx.chat?.type === "group" && !adminIds.includes(ctx.userId))
	)
	{
		return;
	}
	// if (messText === "/admin" && isAdminId) {
	// 	return await sendAdminMenu(ctx);
	// }
	// if (isAdminCommand && isAdminId) {
	//   await next();
	//   return;
	// }
	if (currentMsgId < lastMsgId || (lastMsgId === 0 && !isAdminCommand))
	{
		if (isSupergroup)
		{
			return;
		}
		return await startHandler(ctx);
	}
	ctx.session.lastMsgId = currentMsgId;

	if (ctx?.callbackQuery)
	{
		callbackTracer(<CallbackCtx>ctx);
	}

	await next();
}

async function callbackTracer(ctx: CallbackCtx) {
	const cb = ctx.callbackQuery;
	guardExp(cb.message, "callackTracer error, cbQMessage.text");

	const cbQMessage = cb.message;
	if (cbQMessage.photo)
	{
		await ctx.api.deleteMessage(cbQMessage.chat.id, cbQMessage.message_id);
	}
	if (ctx.session.editMode === false)
	{
		cbQMessage.text = cbQMessage.caption;
	}

	guardExp(cbQMessage.text, "callackTracer error, cbQMessage.text");
	guardExp(
		cbQMessage.reply_markup,
		"callackTracer error, cbQMessage.reply_markup",
	);

	ctx.session.routeHistory.push({
		text: cbQMessage.text,
		reply_markup: cbQMessage.reply_markup,
	});
}
