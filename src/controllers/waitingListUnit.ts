import type { SubT } from "#db/models/ApptSubs.js"
import type { UserT } from "#db/models/Users.js"
import { proceduresInfoManager, settingsServices } from "#helpers/index.js"
import type { MyContext } from "#types/grammy.types.js"
import type { basicCallbackArgs } from "#types/shared.types.js"
import { createApptSubsKs } from "#helpers/moduleUtils/apptSubsUtils.js"
import apptSubsCtrl from "#db/handlers/apptSubsCtrl.js"
import { backButton } from "#keyboards/index.js"
import notificator from "#helpers/notificator.js"

const texts = {
    notSubbed: 'На данный момент вы не подписаны на уведомления о новых приёмах.',
    subbed: 'Вы предварительно записаны на:\n',
    haveSubs: 'На данный момент предварительно заисаны:\n',
    noSubs: 'На данный момент нет предварительных записей.',
}

const waitingListUnit = (ctx: MyContext, ...args: basicCallbackArgs) => ({
    mode: args[0],
    adminMode: args[0] === 'admin',
    pathId: args[1] as string,
    userId: args[2] as string,

    async showMenu(reply = false) {
        console.log(this.adminMode)
        this.adminMode ?
            this.showAdminMenu(reply) :
            this.showUserMenu(reply)
    },

    async showUserMenu(reply = false) {
        const { user, userSubs } = await settingsServices.collectUserData(ctx.userId)

        const h = await showUserMenuH(user, userSubs)

        const text = h.createMessageText()
        const k = h.createKeyboard()

        !reply ?
            ctx.editMessageText(text, { reply_markup: k }) :
            ctx.reply(text, { reply_markup: k })
    },
    async cancelSub() {
        await apptSubsCtrl.delete(+this.userId, +this.pathId)
        await this.showMenu()
        notificator.sendInfoMsg("info", `Пользователь ${ctx.session.user.firstName} ${ctx.session.user.secondName} ${ctx.from?.username} отменил предварительную запись на процедуру`)
    },
    showAdminMenu: async (reply = false) => {
        const h = await showAdminMenuH()

        const text = h.createSubsInfo()
        const k = backButton

        !reply ?
            ctx.editMessageText(text, { reply_markup: k }) :
            ctx.reply(text, { reply_markup: k })
    }
})

const showUserMenuH = async (user: UserT, userSubs: SubT[]) => {
    const { userId } = user
    const proceduresMap = await proceduresInfoManager.getProceduresNamesMap()
    const procedureIds = userSubs.map(({ procedureId }) => procedureId)
    const procedureNames = procedureIds.map(id => proceduresMap.get(id))

    return {
        createMessageText: () => {
            if (userSubs.length === 0) return texts.notSubbed
            const subsList = procedureNames.map((name, i) => {
                return `${i + 1}. ${name}`
            }).join('\n')
            return `${texts.subbed}${subsList}`
        },
        createKeyboard: () => createApptSubsKs.createSubsMenu(procedureIds, userId, proceduresMap),
    }
}

const showAdminMenuH = async () => {
    const subData = await apptSubsCtrl.findAllWithRelations()

    return {
        createSubsInfo: () => {
            if (!subData.length) return texts.noSubs
            const subsList = subData.map(s => {
                const fullName = `${s.User.firstName} ${s.User.secondName}`
                return `${fullName}\n@${s.User.username || 'uknown'}\n${s.Procedure.name}`
            }).join('\n---\n')
            return texts.haveSubs.concat('\n', subsList)
        }
    }
}

export { waitingListUnit }