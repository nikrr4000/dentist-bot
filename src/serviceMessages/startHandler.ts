import errorHandler from "#handlers/logErrorAndThrow.js";
import { guardExp, smoothReplier } from "#helpers/index.js";
import { greetingKeyboard } from "#keyboards/index.js";
import type { MyContext } from "#types/grammy.types.js";
import type { UserT } from "#db/models/Users.js";
import { apptCtrl, usersCtrl } from "#db/handlers/index.js";

export default async function startHandler(ctx: MyContext) {
	ctx.session.routeHistory = [];
	ctx.session.conversation = {};

	const userId = ctx.userId || ctx.callbackQuery?.from.id;
	guardExp(userId, "noId");

	const user = await usersCtrl.find({ userId }).one();
	if (!user)
	{
		await ctx.conversation.enter("userReg");
		return;
	}
	const appts = await apptCtrl.findFutureAppts()
	const foundAppts = !!appts && appts.length > 0

	return await sendStartMessage(ctx, user, foundAppts);
}

function sendStartMessage(ctx: MyContext, user: UserT, foundAppts: boolean) {
	try
	{
		const h = sendStartMessageHelpers;

		h.ctxFiller(ctx, user);
		const greeting = h.createGreetingText(user.firstName, foundAppts);
		const keyboard = greetingKeyboard(foundAppts);
		return smoothReplier(ctx, greeting, keyboard, "startHandler");
	} catch (err)
	{
		errorHandler(err, "fatal", "Error inside startHandler");
	}
}

const sendStartMessageHelpers = {
	createGreetingText(firstName: string, foundAppts: boolean) {
		let greeting = `Привет, ${firstName}!\nЗдесь можно записаться ко мне на прием, просто покликав кнопки. Если не хочешь кликать кнопки или есть вопросы - пишиии сюда @darialalala`;
		greeting += !foundAppts && '\n\nСейчас открытых записей нет, но ты можешь записаться в лист ожидания нажав на кнопку "Лист ожидания". Когда запись будет открыта, ты получишь уведомление.'
		return greeting;
	},
	ctxFiller(ctx: MyContext, user: UserT) {
		const userSession = ctx.session.user;
		userSession.firstName = user.firstName;
		userSession.secondName = user.secondName;

		return { userSession };
	},
};
