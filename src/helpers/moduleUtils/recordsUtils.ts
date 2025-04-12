import recordsCtrl from "#db/handlers/recordsCtrl.js"
import usersCtrl from "#db/handlers/usersCtrl.js"
import type { RecordAppointmentProcedureT, RecordProcedureT } from "#types/shared.types.js"
import { InlineKeyboard } from "grammy"
import { slotsServices } from "./apptSlotsUtils.js"
import dates from "#helpers/dates.js"
import { addMainMenuButton, keyboardFromData } from "#helpers/index.js"
import { usersInfoManager } from "./usersUtils.js"
import type { RecordT } from "#db/models/Records.js"
import notificator from "#helpers/notificator.js"

const recordServices = {
    cancelRecord: async (recordId: number) => {
        const record = (await recordsCtrl.findFutureRecords({ id: recordId }))[0]
        const user = await usersCtrl.find({ userId: record.userId }).one()

        const destroyRes = recordsCtrl.destroy({ id: recordId })
        await slotsServices(0).discardRecordSlots(recordId)

        const [start, end] = [record.start, record.end].map(el => dates.getStrDateWithoutDate(dates.parseApptDate(el)))

        let text = 'Запись отменена:\n'
        const date = dates.parseApptDate(record.Appointment.start)
        text += `Дата приема: ${dates.getStrDateWithoutTime(date)}\n`
        text += `Время приема: ${start} - ${end}\n`
        text += `Пациент: ${user?.firstName} ${user?.secondName}, \n@${user?.username}`

        notificator.sendInfoMsg('record', text)

        return true
    },
    async notificateAboutAppt(apptId: number) {
        const records = await recordsCtrl.findFutureRecords({ apptId });
        if (!records.length) return
        for (const record of records)
        {
            // TODO: add one-message notification
            const userId = record.userId
            const k = createRecordKs.confirmCancel(record)

            let text = 'Вы записаны на следующую запись.\n'
            text += createRecordTexts.recordInfo(record)
            text += 'Подтвердите её или она будет автоматически отменена.'
            // TODO: Add check if all messages were sent
            notificator.sendMessageById(text, userId, k)
        }
    }
}

const createRecordTexts = {
    basicText: (place: string, date: string, procedureName: string, slotInterval: string) => {
        let text = `🗓${date}\n`
        text += `🦷${procedureName}\n`
        text += `🕔${slotInterval}\n`
        text += `📍${place}\n`
        return text
    },
    getStartEndStr: (ds: [Date, Date]) => {
        return ds.map(date => dates.getStrDateWithoutDate(dates.parseApptDate(date)).trim())
    },
    recordInfo(record: RecordAppointmentProcedureT) {
        const [start, end] = this.getStartEndStr([record.start, record.end])
        const date = dates.getStrDateWithoutTime(dates.parseApptDate(record.start))

        let text = `🗓${date}\n`
        text += `🦷${record.Procedure.name}\n`
        text += `🕔${start} - ${end}\n`
        text += `📍${record.Appointment.place}\n`

        return text
    },
    async recordsInfo(apptId: number) {
        const records = await recordsCtrl.findFutureRecords({ apptId })
        const sortedRecords = records.sort((a, b) => a.start.getTime() - b.start.getTime())

        const listPromises = sortedRecords.map(async record => {
            const [start, end] = this.getStartEndStr([record.start, record.end])

            let text = `${record.Procedure.name}\n`
            text += `${start} - ${end}\n`

            const user = await usersCtrl.find({ userId: record.userId }).one()
            if (!user) text += `При поиске имени пользователя произошла ошибка. Его id: ${record.userId}\n`
            else
            {
                const userFullName = await usersInfoManager.getUserFullName(record.userId, user)
                text += `${userFullName}\n`
                text += `@${user.username}\n`
            }
            return text
        })
        const list = (await Promise.all(listPromises)).join('\n')

        return list
    },
}

const createRecordKs = {
    basic: (records: RecordProcedureT[], isAdmin: boolean) => {
        const mode = isAdmin ? 'admin' : 'user'

        const buttonsData = records.map(record => {
            const dateStr = dates.parseApptDate(record.start)
            const day = dates.getStrDateWithoutTime(dateStr)

            const label = `${day} - ${record.Procedure.name}`
            const data = `record_check_${mode}__${record.id}_${record.userId}`

            return [label, data] as [string, string]
        })

        return keyboardFromData(buttonsData)
    },
    getRecordActions: (record: RecordT) => {
        const k = new InlineKeyboard()
            .text('Отменить запись', `record_cancel_user__${record.id}_${record.userId}`)
            .row()

        return k.text('Назад', 'back')
    },
    confirmCancel: (record: RecordT) => {
        const k = new InlineKeyboard()
            .text('Отменить запись', `record_cancel_user__${record.id}_${record.userId}`)
            .text('Подтвердить', 'record_confirm_user')

        return addMainMenuButton(k)
    },

}

export { recordServices, createRecordTexts, createRecordKs }