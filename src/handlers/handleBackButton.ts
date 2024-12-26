import guardExp from "#helpers/guardExp.js";
import type { MyContext } from "#types/grammy.types.js";

export default async function (ctx: MyContext) {
  const canEdit = ctx.session.editMode;
  await ctx.session.routeHistory.pop(); //фальшивка
  const routeParams = ctx.session.routeHistory.pop();
  guardExp(routeParams, "routeParams inside handleBackButton");
  // ctx.session.conversation = {};

  if (canEdit) {
    await ctx.editMessageText(routeParams.text, {
      reply_markup: routeParams.reply_markup,
      parse_mode: "HTML",
    });
  } else {
    await ctx.reply(routeParams.text, {
      reply_markup: routeParams.reply_markup,
      parse_mode: "HTML",
    });
    //FIXME
    ctx.session.editMode = true;
  }
  ctx.answerCallbackQuery();
}
