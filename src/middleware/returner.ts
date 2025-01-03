import startHandler from "#serviceMessages/startHandler.js";
import type { NextFunction } from "grammy";
import type { MyContext } from "#types/grammy.types.js";

export default async function (ctx: MyContext, next: NextFunction) {
    const messObj = ctx.message;

    const chatType = ctx.chat?.type
    const userIsAdmin = ctx.session.isAdmin

    const cbMessageId = ctx?.callbackQuery?.message?.message_id;
    const updateMessageId = ctx?.update?.message?.message_id;
    const currentMsgId = cbMessageId ?? updateMessageId ?? 0;

    const lastMsgId = ctx.session.lastMsgId ?? 0;
    const messText = ctx.message?.text || "fillme";
    const isTopic = messObj?.is_topic_message;
    const isSupergroup = chatType === "supergroup";
    const adminCommands = ["/admin", "/init"];
    const isAdminCommand = adminCommands.includes(messText);

    if (
        isTopic || !userIsAdmin
    )
    {
        return;
    }

    if (currentMsgId < lastMsgId || (lastMsgId === 0 && !isAdminCommand))
    {
        if (isSupergroup)
        {
            return;
        }
        return await startHandler(ctx);
    }
    ctx.session.lastMsgId = currentMsgId;

    await next();
}