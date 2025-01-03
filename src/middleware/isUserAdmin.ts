import type { NextFunction } from "grammy";
import type { MyContext } from "#types/grammy.types.js";
import sanitizedConfig from "#root/config.js";

export default async function (ctx: MyContext, next: NextFunction) {
    const adminIds = sanitizedConfig.ADMIN_IDS.split("|").map(Number);
    const userId = ctx.from?.id;

    if (userId && adminIds.includes(userId))
    {
        ctx.session.isAdmin = true
    }
    await next();
}
