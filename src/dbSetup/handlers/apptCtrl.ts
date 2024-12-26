import { sequelize } from "#db/dbClient.js";
import Appointments, {
	type AppointmentT,
	type AppointmentCreationT,
} from "#db/models/Appointments.js";
import type { operationLog } from "#types/shared.types.js";
import { Op, type Transaction } from "sequelize";
import apptSlotsCtrl from "./apptSlotsCtrl.js";
import dates from "#helpers/dates.js";
import logErrorAndThrow from "#handlers/logErrorAndThrow.js";

export default {
	async create(query: AppointmentCreationT) {
		const opResult = {
			status: "ok",
			details: undefined,
		} as operationLog;
		const transaction = await sequelize.transaction();

		try
		{
			const createdAppt = await Appointments.create(query, { transaction });
			const createdSlots = await apptSlotsCtrl.bulkCreateObjsAndDbRecords(
				createdAppt,
				transaction,
			);

			if (!createdAppt || !createdSlots)
			{
				throw new Error("Failed to create appointment or slots.");
			}

			await transaction.commit();
			return opResult;
		} catch (err)
		{
			const error = err as Error;
			opResult.status = error;
			opResult.details = `${error.message}\n`;

			await transaction.rollback();
			return opResult;
		}
	},
	findOne(query?: Partial<AppointmentT>) {
		return Appointments.findOne({ where: query });
	},
	findFutureAppts: () => {
		try
		{
			return Appointments.findAll({
				where: {
					start: { [Op.gt]: dates.currDate() },
					ended: { [Op.is]: false },
				},
			});
		} catch (err)
		{
			logErrorAndThrow(
				err,
				"fatal",
				"Db error. meetingsController error: futureMeetings unavailable",
			);
		}
	},
	destroy: (query: Partial<AppointmentT>, transaction?: Transaction) => Appointments.destroy({ where: query, transaction },)
};
