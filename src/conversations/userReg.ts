import { guardExp } from "#helpers/index.js";
import logErrorAndThrow from "#handlers/logErrorAndThrow.js";
import startHandler from "#serviceMessages/startHandler.js";
import type { MyContext, MyConversation } from "#types/grammy.types.js";
import UsersCtrl from "#db/handlers/usersCtrl.js";
import notificator from "#helpers/notificator.js";

export async function userReg(
	conversation: MyConversation,
	ctx: MyContext,
) {
	try
	{
		const text = regTextObj();

		const firstName = await getUserInput(
			conversation,
			ctx,
			text.name,
			text.otherwise,
		);

		const secondName = await getUserInput(
			conversation,
			ctx,
			text.secName,
			text.otherwise,
		);

		guardExp(ctx.from?.id, "user_id inside userRegistrationConv");
		const userData = {
			userId: ctx.userId,
			firstName,
			secondName,
			username: ctx.from.username || "uknown",
		}

		await UsersCtrl.create(userData);

		const lastMsgId = await startHandler(ctx);
		notificator.sendInfoMsg('info',
			`Был зарегистрирован новый пользователь:\nИмя: ${userData.firstName} ${userData.secondName}\n@${userData.username}`
		)
		conversation.session.lastMsgId = lastMsgId || 0;
	} catch (err)
	{
		logErrorAndThrow(err, "fatal", "error during userRegistration");
	}
}

export async function changeName(conversation: MyConversation,
	ctx: MyContext,) {
	try
	{
		const text = regTextObj();

		const firstName = await getUserInput(
			conversation,
			ctx,
			text.name,
			text.otherwise,
		);

		const secondName = await getUserInput(
			conversation,
			ctx,
			text.secName,
			text.otherwise,
		);

		guardExp(ctx.from?.id, "user_id inside userRegistrationConv");
		// TODO: i don't understand why but it doesn't work without then
		UsersCtrl.update({ userId: ctx.from.id }, { firstName, secondName }).then(_ => startHandler(ctx))

		notificator.sendInfoMsg('info',
			`Пользователь @${ctx.from.username} изменил свои данные:\nИмя: ${firstName} ${secondName}`
		)
	} catch (err)
	{
		logErrorAndThrow(err, "fatal", "error during userRegistration");
	}
}

async function getUserInput(
	conversation: MyConversation,
	ctx: MyContext,
	messageText: string,
	otherwiseText: string,
) {
	await ctx.reply(messageText, { parse_mode: "HTML" });
	const { message } = await conversation.waitFor("message:text", {
		otherwise: (ctx) => {
			ctx.reply(otherwiseText);
		},
	});
	return message.text;
}

const regTextObj = (): { name: string; secName: string; otherwise: string } => {
	const name = "Пожалуйста, напишите ваше <b>имя</b>";
	const secName = "Напишите вашу <b>фамилию</b>\n";

	const otherwise = "Используйте текст";

	return { name, secName, otherwise };
};
