import errorHandler from "#handlers/logErrorAndThrow.js";
import { guardExp, smoothReplier } from "#helpers/index.js";
import { greetingKeyboard } from "#keyboards/index.js";
import type { MyContext } from "#types/grammy.types.js";
import type { UserT } from "#db/models/Users.js";
import { usersCtrl } from "#db/handlers/index.js";

export default async function startHandler(ctx: MyContext) {
	ctx.session.routeHistory = [];
	ctx.session.conversation = {};

	const userId = ctx.userId || ctx.callbackQuery?.from.id;
	guardExp(userId, "noId");

	const user = await usersCtrl.find({ userId }).one();
	if (!user) {
		await ctx.conversation.enter("userReg");
		return;
	}
	return await sendStartMessage(ctx, user);
}

async function sendStartMessage(ctx: MyContext, user: UserT) {
	try {
		const h = sendStartMessageHelpers;

		h.ctxFiller(ctx, user);
		const greeting = h.createGreetingText(user.firstName);
		const keyboard = greetingKeyboard();
		return await smoothReplier(ctx, greeting, keyboard, "startHandler");
	} catch (err) {
		errorHandler(err, "fatal", "Error inside startHandler");
	}
}

const sendStartMessageHelpers = {
	createGreetingText(firstName: string) {
		const greeting = `Привет, ${firstName}.`;
		return greeting;
	},
	ctxFiller(ctx: MyContext, user: UserT) {
		const userSession = ctx.session.user;
		userSession.firstName = user.firstName;
		userSession.secondName = user.secondName;

		return { userSession };
	},
};
