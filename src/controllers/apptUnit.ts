import apptCtrl from "#db/handlers/apptCtrl.js";
import { apptsKServices, apptsServices } from "#helpers/apptUtils.js";
import notificator from "#helpers/notificator.js";
import { createRecordTexts } from "#helpers/recordsUtils.js";
import { adminMenu, backButton } from "#keyboards/generalKeyboards.js";
import type { MyContext } from "#types/grammy.types.js";
import type { basicCallbackArgs } from "#types/shared.types.js";
import type { InlineKeyboard } from "grammy";
import { log } from "node:console";

export default (ctx: MyContext, ...args: basicCallbackArgs) => ({
    mode: args[0],
    adminMode: args[0] === 'admin',
    pathId: args[1],
    userId: args[2],
    async showApptInfo() {
        let text: string
        let k: InlineKeyboard
        try
        {
            if (!this.pathId) throw new Error()
            const appt = await apptCtrl.findOne({ id: +this.pathId })
            if (!appt) throw new Error()

            const apptInfo = apptsServices.createApptInfo(appt)
            const recordsList = await createRecordTexts.recordsInfo(+this.pathId)

            text = `${apptInfo}\n${recordsList}`
            k = apptsKServices.getApptActions(appt)
        } catch (error)
        {
            notificator.sendInfoMsg('error', `Внутри showApptInfo произошла ошибка:\n${(error as Error).message}\nInfo:\nmode: ${this.mode}\nadminMode: ${this.adminMode}\nuserId: ${this.userId}`)
            text = 'Встреча не найдена. Произошла ошибка.'
            k = backButton
        }

        ctx.editMessageText(text, { reply_markup: k })
    },
    async cancelAppt() {
        let text: string
        const k = adminMenu.menu

        try
        {
            if (!this.pathId) throw new Error()
            const cancelRes = apptsServices.cancelAppt(+this.pathId)
            if (!cancelRes) throw new Error()
            text = 'Отмена записи и уведомление пользователей об отмене прошли успешно.'

        } catch (error)
        {
            notificator.sendInfoMsg('error', `Внутри cancelAppt произошла ошибка:\n${(error as Error).message}\nInfo:\nmode: ${this.mode}\nadminMode: ${this.adminMode}\nuserId: ${this.userId}`)
            text = 'При попытке отменить встречу произошла ошибка. Попробуйте еще раз.'
        }

        ctx.editMessageText(text, { reply_markup: k })
    }
})