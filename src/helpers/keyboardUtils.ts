import type { MyContext } from "#types/grammy.types.js";
import { InlineKeyboard, type CallbackQueryContext } from "grammy";

const getCallbackData = (ctx: CallbackQueryContext<MyContext>) =>
	ctx.callbackQuery.data;

const addMainMenuButton = (k: InlineKeyboard) => k.row().text('Главное меню', "gen_main-menu")
const addBackButton = (k: InlineKeyboard) => k.row().text('Назад', 'back')

const handleMenuDenyConfirmKAnswer = (ctx: CallbackQueryContext<MyContext>) => {
	const answer = getCallbackData(ctx);
	return answer === "confirm";
};

const keyboardFromData = (buttonsData: [string, string][]) => {
	const k = new InlineKeyboard();
	for (const [label, data] of buttonsData)
	{
		k.text(label, data).row();
	}
	return k;
};

const callbackDataSplitter = <T>(ctx: CallbackQueryContext<MyContext>) => {
	type defaultCallbackData = [string, T, 'user' | 'admin', string, string];

	return getCallbackData(ctx)
		.split("__")
		.flat()
		.flatMap((el) => el.split("_")) as defaultCallbackData;
};

export { handleMenuDenyConfirmKAnswer, addMainMenuButton, callbackDataSplitter, keyboardFromData, addBackButton };
