import Appointments, { type AppointmentT } from "#db/models/Appointments.js";
import Procedures, { type ProcedureT } from "#db/models/Procedures.js";
import Records, { type RecordT, type RecordCreationT } from "#db/models/Records.js";
import dates from "#helpers/dates.js";
import type { RecordAppointmentProcedureT } from "#types/shared.types.js";
import { Op, type Transaction } from "sequelize";

export default {
    create: (obj: RecordCreationT, transaction: Transaction) => Records.create(obj, { transaction }),
    find: (query?: Partial<RecordT>) => {
        return {
            all: () => Records.findAll({ where: query }),
            one: () => Records.findOne({ where: query }),
        };
    },
    findFutureRecords: (query: Partial<RecordT>) => {
        const res = Records.findAll({
            include: [{ model: Procedures, required: true }, {
                model: Appointments,
                required: true,
                where: { start: { [Op.gt]: dates.currDate() } },
            }], where: query,
        }) as unknown
        return res as Promise<RecordAppointmentProcedureT[]>
    },
    destroy: (query: Partial<RecordT>) => Records.destroy({ where: query })
}