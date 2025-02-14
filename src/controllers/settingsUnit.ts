import { addMainMenuButton, constructDefaultButtonsData } from "#helpers/index.js";
import notificator from "#helpers/notificator.js";
import { settingsServices } from "#helpers/index.js";
import type { MyContext } from "#types/grammy.types.js";
import type { basicCallbackArgs, dataStructure, settingsDataT } from "#types/shared.types.js";
import { InlineKeyboard } from "grammy";

const settingsUnit = (ctx: MyContext, ...args: basicCallbackArgs) => ({
    mode: args[0],
    adminMode: args[0] === 'admin',
    pathId: args[1],
    userId: args[2],

    async showSettings(reply = false) {
        const { user } = await settingsServices.collectUserData(ctx.userId)
        const h = showSettingsH({ user })
        const text = h.createMessageText()
        const k = h.createKeyboard()

        !reply ?
            ctx.editMessageText(text, { reply_markup: k }) :
            ctx.reply(text, { reply_markup: k })
    },
    changeName: async () => {
        ctx.deleteMessage()
        await ctx.conversation.enter('changeName')
    },
    switchSub: async function () {
        await settingsServices.switchSubNotifs(ctx.userId, !!Number(this.pathId))
        notificator.sendInfoMsg('info', `Пользователь с id ${ctx.userId} @${ctx.from?.username || 'unknown'} подписался на новые приемы.`)
        this.showSettings()
    }
})


const showSettingsH = ({ user }: settingsDataT) => ({
    createMessageText: function () {
        let text = `👤 Ваше имя: ${user.firstName} ${user.secondName}\n`
        text += `Подписка на новые записи: ${this.getSubEmoji}`
        return text
    },
    getSubEmoji: user.newApptsSub ? '🟢' : '🔴',
    getBit: user.newApptsSub ? 1 : 0,
    getSubButtonText: user.newApptsSub ? 'Отменить подписку' : 'Подписаться на уведомления',
    createKeyboard: function () {
        return addMainMenuButton(new InlineKeyboard().text(...this.createData('Изменить имя', 'change-name')))
            .row()
            .text(...this.createData(`${this.getSubEmoji}${this.getSubButtonText}`, 'switch-sub'))
    },
    createData: function (label: string, action: string) {
        const data: dataStructure = { path: 'settings', action: action, mode: 'user', pathId: this.getBit, userId: user.userId }
        return constructDefaultButtonsData([label], [data]).flat() as [string, string]
    }
})

export { settingsUnit }