import { addBackButton } from "#helpers/keyboardUtils.js";
import { proceduresKManager, proceduresInfoManager } from "#helpers/index.js";
import type { MyConversation, MyContext } from "#types/grammy.types.js";
import type { InlineKeyboard } from "grammy";
import unlessActions from "./helpers/unlessActions.js";
import apptSubsCtrl from "#db/handlers/apptSubsCtrl.js";
import { mainMenu } from "#keyboards/generalKeyboards.js";
import { createApptSubsKs } from "#helpers/moduleUtils/apptSubsUtils.js";
import notificator from "#helpers/notificator.js";

export async function createApptSub(conversation: MyConversation,
    ctx: MyContext,) {
    const h = createApptSubHelpers(ctx, conversation)

    let resT: string
    let err = false
    try
    {
        const { t, k } = await h.getKAndText()
        const [label, id] = await h.handleProcedureId(t, k)

        const createSubRes = await h.createSub(id)
        notificator.sendInfoMsg("info", `Пользователь ${ctx.session.user.firstName} ${ctx.session.user.secondName} ${ctx.from?.username} подписался на процедуру "${label}"`)
        resT = h.texts.success(label)
    } catch (error)
    {
        resT = h.texts.error
        err = true
    }
    h.handleResult(resT, err)
}

const createApptSubHelpers = (ctx: MyContext, conversation: MyConversation) => ({
    userId: ctx.from?.id as number,
    texts: {
        procedureId: "Выберите подходящую процедуру:\n",
        error: 'При попытке создать предварительную запись произошла ошибка. Попробуйте позже',
        success: (procedureLabel: string) => `Вы были предварительно записаны на "${procedureLabel}".\nКогда появится запись, вы получите уведомление и сможете записаться на приём.`,
    },
    getKAndText: async function () {
        const basicK = await proceduresKManager.getList();
        const k = addBackButton(basicK)
        const descriptions = await proceduresInfoManager.getProceduresDescrList()
        const t = `${this.texts.procedureId}${descriptions}`
        return { k, t }
    },
    handleProcedureId: async (t: string, k: InlineKeyboard) => {
        await ctx.editMessageText(t, { reply_markup: k });
        const { callbackQuery: { data } } = await conversation.waitForCallbackQuery(/\d+/, { otherwise: (ctx) => unlessActions(ctx) });
        const [label, id] = data.split("__")

        return [label, +id] as [string, number];
    },
    createSub(procedureId: number) { return apptSubsCtrl.createSub(this.userId, procedureId) },
    async handleResult(text: string, error: boolean) {
        const k = mainMenu.menu
        ctx.editMessageText(text, { reply_markup: k })
    }

})