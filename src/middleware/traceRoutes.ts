import { guardExp } from "#helpers/index.js";
import type { NextFunction } from "grammy";
import type { CallbackCtx } from "#types/grammy.types.js";
import type { MyContext } from "#types/grammy.types.js";

export default async function (ctx: MyContext, next: NextFunction) {
	if (ctx.callbackQuery)
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
