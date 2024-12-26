import recordsCtrl from "#db/handlers/recordsCtrl.js";
import { apptsServices } from "#helpers/apptUtils.js";
import { createRecordKs, createRecordTexts, recordServices } from "#helpers/recordsUtils.js";
import { mainMenu } from "#keyboards/generalKeyboards.js";
import type { MyContext } from "#types/grammy.types.js";
import type { basicCallbackArgs } from "#types/shared.types.js";
import type { InlineKeyboard } from "grammy";

export default (ctx: MyContext, ...args: basicCallbackArgs) => ({
    mode: args[0],
    adminMode: args[0] === 'admin',
    pathId: args[1] || 0,
    userId: args[2] || 0,
    async showRecordInfo() {
        let text: string
        let k: InlineKeyboard

        try
        {
            const record = await recordsCtrl.findFutureRecords({ id: +this.pathId, userId: +this.userId })
            if (!record) throw new Error()
            const recordInfo = createRecordTexts.recordInfo(record[0])

            text = recordInfo
            k = createRecordKs.getRecordActions(record[0])
        } catch (error)
        {
            text = 'Запись не найдена. Попробуйте зайти позже'
            k = mainMenu.menu
        }
        ctx.editMessageText(text, { reply_markup: k })
    },
    async cancelRecord() {
        let text: string
        const k = mainMenu.menu

        try
        {
            await recordServices.cancelRecord(+this.pathId)

            text = 'Запись успешно удалена'
        } catch (error)
        {
            text = 'При удалении произошла ошибка. Попробуйте позже'
        }
        ctx.editMessageText(text, { reply_markup: k })
    }
})