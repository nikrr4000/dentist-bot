import usersCtrl from "#db/handlers/usersCtrl.js"
import type { UserT } from "#db/models/Users.js"

const usersInfoManager = {
    getFullNameList: async () => {
        const users = await usersCtrl.find().all()

        return users.reduce((acc, el) => {
            acc.set(el.id, `${el.firstName} ${el.secondName}`)
            return acc
        }, new Map<number, string>())
    },
    getUserFullName: async (userId: number, userObj?: UserT) => {
        const user = userObj || await usersCtrl.find({ userId }).one()
        if (!user) return null
        return `${user.firstName} ${user.secondName}`
    }
}

export { usersInfoManager }