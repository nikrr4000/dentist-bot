import apptSubsCtrl from "#db/handlers/apptSubsCtrl.js";
import usersCtrl from "#db/handlers/usersCtrl.js";
import type { settingsDataT } from "#types/shared.types.js";

const settingsServices = {
    collectUserData: async (userId: number): Promise<settingsDataT> => {
        const user = await usersCtrl.find({ userId }).one()
        if (!user) throw new Error('User not found')
        const userSubs = await apptSubsCtrl.find(user.userId)
        return { user, userSubs }
    },
    switchSubNotifs: async (userId: number, hasSub: boolean) => {
        const res = await usersCtrl.setApptSub(userId, !hasSub)

        if (res[0] === 1) return true
        return false
    },
}

export { settingsServices }