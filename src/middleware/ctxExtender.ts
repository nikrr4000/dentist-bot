import type { NextFunction } from "grammy";
import type { MyContext } from "#types/grammy.types.js";

export default async function (ctx: MyContext, next: NextFunction) {
  const userId = ctx.from?.id;
  if (userId) {
    ctx.userId = userId;
  }
  await next();
}
