import apptSubsCtrl from "#db/handlers/apptSubsCtrl.js"
import { addMainMenuButton, keyboardFromData } from "#helpers/keyboardUtils.js"
import { mainMenu } from "#keyboards/generalKeyboards.js"
import generalConfigs from "#root/botConfig/generalConfigs.js"

export const createApptSubsKs = {
    path: 'waiting-list',
    createCancelButtonsPayload(procedureIds: number[], userId: number, proceduresMap: Map<number, string>) {
        const procedureNames = procedureIds.map((procedureId) => proceduresMap.get(procedureId))
        return procedureIds.map((id, i) => {
            const name = procedureNames[i]
            return [`Отменить "${name}"`, `${this.path}_cancel_user__${id}_${userId}`] as [string, string]
        })
    },
    createSubButtonPayload() { return ['Записаться предварительно', `${this.path}_create_user`] as [string, string] },
    createSubsMenu(procedureIds: number[], userId: number, proceduresMap: Map<number, string>) {
        const payloads: [string, string][] = []
        const subsLimit = generalConfigs.maxProcedureSubs

        if (procedureIds.length < subsLimit)
        {
            const subButtonPayload = this.createSubButtonPayload()
            payloads.push(subButtonPayload)
        }
        const cancelButtonsPayloads = this.createCancelButtonsPayload(procedureIds, userId, proceduresMap)
        payloads.push(...cancelButtonsPayloads)

        const k = keyboardFromData(payloads)
        return addMainMenuButton(k)
    },
    async createAdditionalSubK(userId: number, err: boolean) {
        const subs = await apptSubsCtrl.find(userId)
        if (subs.length < generalConfigs.maxProcedureSubs && !err)
        {
            const payload = this.createSubButtonPayload()
            return addMainMenuButton(keyboardFromData([payload]))
        }
        return mainMenu.menu
    }
}