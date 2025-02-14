import startHandler from "#serviceMessages/startHandler.js";
import type { MyContext } from "#types/grammy.types.js";
import { Composer } from "grammy";
import logErrorAndThrow from "./logErrorAndThrow.js";
import { callbackDataSplitter } from "#helpers/keyboardUtils.js";
import sendAdminMenu from "#serviceMessages/sendAdminMenu.js";
import type { basicCallbackArgs } from "#types/shared.types.js";
import { guardExp } from "#helpers/guardExp.js";
import { genUnit, settingsUnit, recordsUnit, apptUnit } from "#controllers/index.js";

export const keyboard = new Composer<MyContext>();

keyboard.callbackQuery(/gen_/, async (ctx) => {
	type actionMap = "appt-check" | "admin-menu" | 'main-menu' | 'records-check' | 'settings';

	const actionsMap: Record<
		actionMap,
		(ctx: MyContext, ...args: basicCallbackArgs) => Promise<void>
	> = {
		"appt-check": async (ctx, ...args) => genUnit(ctx, ...args).showApptMenu(),
		'admin-menu': async (ctx, ...args) => sendAdminMenu(ctx),
		'main-menu': async (ctx, ...args) => { startHandler(ctx) },
		'records-check': async (ctx, ...args) => genUnit(ctx, ...args).showSchedule(),
		'settings': async (ctx, ...args) => genUnit(ctx, ...args).showSettings()
	};

	// TODO: Add more strict typing: third and fourth types acn be undefined
	const [_, actionName, actionMode, pathId, userId] =
		callbackDataSplitter<actionMap>(ctx);

	const action = actionsMap[actionName];

	try
	{
		if (!actionName)
		{
			throw new Error('No path inside "appt_ catcher"');
		}
		await action(ctx, actionMode, pathId, userId);
	} catch (error)
	{
		logErrorAndThrow(
			error,
			actionName ? "error" : "debug",
			actionName ? "error handling gen_ path" : "path error",
		);
		await startHandler(ctx);
	}
});

keyboard.callbackQuery(/settings_/, async (ctx) => {
	type actionMap = "switch-sub" | 'change-name'

	const actionsMap: Record<
		actionMap,
		(ctx: MyContext, ...args: basicCallbackArgs) => Promise<void>
	> = {
		'switch-sub': async (ctx, ...args) => settingsUnit(ctx, ...args).switchSub(),
		'change-name': async (ctx, ...args) => settingsUnit(ctx, ...args).changeName(),
	};

	const [_, actionName, actionMode, pathId, userId] =
		callbackDataSplitter<actionMap>(ctx);

	const action = actionsMap[actionName];

	try
	{
		if (!actionName)
		{
			throw new Error('No path inside "appt_ catcher"');
		}
		await action(ctx, actionMode, pathId, userId);
	} catch (error)
	{
		logErrorAndThrow(
			error,
			actionName ? "error" : "debug",
			actionName ? "error handling appt_ path" : "path error",
		);
		await startHandler(ctx);
	}
})

keyboard.callbackQuery(/appt_/, async (ctx) => {
	type actionMap = "create" | 'check' | 'cancel'

	const actionsMap: Record<
		actionMap,
		(ctx: MyContext, ...args: basicCallbackArgs) => Promise<void>
	> = {
		create: async (ctx) =>
			await ctx.conversation.enter("createAppt"),
		check: async (ctx, ...args) => apptUnit(ctx, ...args).showApptInfo(),
		cancel: async (ctx, ...args) => apptUnit(ctx, ...args).cancelAppt()
	};

	const [_, actionName, actionMode, pathId, userId] =
		callbackDataSplitter<actionMap>(ctx);

	const action = actionsMap[actionName];

	try
	{
		if (!actionName)
		{
			throw new Error('No path inside "appt_ catcher"');
		}
		await action(ctx, actionMode, pathId, userId);
	} catch (error)
	{
		logErrorAndThrow(
			error,
			actionName ? "error" : "debug",
			actionName ? "error handling appt_ path" : "path error",
		);
		await startHandler(ctx);
	}
});

keyboard.callbackQuery(/record_/, async (ctx) => {
	type actionMap = "create" | 'check' | 'cancel' | 'confirm';

	const actionsMap: Record<
		actionMap,
		(ctx: MyContext, ...args: basicCallbackArgs) => Promise<void>
	> = {
		create: async (ctx, ...args) => {
			guardExp(args[1], 'apptNumber inside record_ cb')
			ctx.session.temp.apptNumber = +args[1];
			await ctx.conversation.enter("createRecord");
		},
		check: async (ctx, ...args) => recordsUnit(ctx, ...args).showRecordInfo(),
		cancel: async (ctx, ...args) => recordsUnit(ctx, ...args).cancelRecord(),
		confirm: async (ctx, ...args) => recordsUnit(ctx, ...args).confirmRecord()
	};

	const [_, actionName, actionMode, pathId, userId] =
		callbackDataSplitter<actionMap>(ctx);
	const action = actionsMap[actionName];

	try
	{
		if (!actionName)
		{
			throw new Error('No path inside "appt_ catcher"');
		}
		await action(ctx, actionMode, pathId, userId);
	} catch (error)
	{
		logErrorAndThrow(
			error,
			actionName ? "error" : "debug",
			actionName ? "error handling appt_ path" : "path error",
		);
		await startHandler(ctx);
	}
});