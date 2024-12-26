import { adminMenuKeyboard } from "#keyboards/index.js";
import errorHandler from "#handlers/logErrorAndThrow.js";
import { smoothReplier, guardExp } from "#helpers/index.js";
import type { MyContext } from "#types/grammy.types.js";

export default async function (ctx: MyContext) {
  ctx.session.conversation = {};
  try {
    await smoothReplier(
      ctx,
      "There'll be some service info",
      adminMenuKeyboard(),
      "sendAdminMenu"
    );
  } catch (err) {
    errorHandler(err, "warn", "Error at sendAdminMenu");
  }
}
