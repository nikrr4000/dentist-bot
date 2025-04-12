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
        const userData = await settingsServices.collectUserData(ctx.userId)
        const h = showSettingsH(userData)
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
})


const showSettingsH = ({ user }: settingsDataT) => ({
    createMessageText: function () {
        return `👤 Ваше имя: ${user.firstName} ${user.secondName}\n`

    },
    createKeyboard: function () {
        return addMainMenuButton(new InlineKeyboard().text('Изменить имя', 'change-name'))
    }
    // createData: function (label: string, action: string) {
    //     const data: dataStructure = { path: 'settings', action: action, mode: 'user', pathId: this.getBit, userId: user.userId }
    //     return constructDefaultButtonsData([label], [data]).flat() as [string, string]
    // }
})

export { settingsUnit }