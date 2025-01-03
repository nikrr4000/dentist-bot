import type { AppointmentT } from "#db/models/Appointments.js";
import ApptSlots, { type ApptSlotsCreationT, type ApptSlotsT } from "#db/models/ApptSlots.js";
import { type FindOptions, Op, type Transaction } from "sequelize";

export default {
	bulkCreateObjsAndDbRecords(apptInfo: AppointmentT, transaction?: Transaction) {
		const dataBulk = this.createObjsBulk(apptInfo);
		return ApptSlots.bulkCreate(dataBulk, { transaction });
	},
	createObjsBulk(apptInfo: AppointmentT) {
		const minutesInterval = 15;
		const slots = [];
		let nextTime = apptInfo.start;
		while (nextTime <= apptInfo.end)
		{
			slots.push({
				time: nextTime,
				apptId: apptInfo.id,
			});
			nextTime = new Date(nextTime.getTime() + minutesInterval * 60000);
		}
		return slots;
	},
	update: (data: Partial<ApptSlotsT>, query: Partial<ApptSlotsT>) => ApptSlots.update(data, { where: query }),
	create: {
		one: (apptSlot: ApptSlotsCreationT, transaction?: Transaction) => ApptSlots.create(apptSlot, { transaction }),
		bulk: (apptSlots: ApptSlotsCreationT[], transaction?: Transaction) => ApptSlots.bulkCreate(apptSlots, { transaction })
	},
	getSlotsByIds: (ids: number[]) => ApptSlots.findAll({ where: { id: { in: ids } } }),
	getFindFunc: () => ({
		findAll: (options?: FindOptions<ApptSlotsT> | undefined) => ApptSlots.findAll(options),
		findOne: (options?: FindOptions<ApptSlotsT> | undefined) => ApptSlots.findOne(options),
	}),
	getSlots(query: Partial<ApptSlotsT>) {
		return ApptSlots.findAll({ where: query });
	},
	getSlotsById: (query: number | number[]) => ApptSlots.findAll({ where: { id: query } }),
	find: (query?: Partial<ApptSlotsT>) => {
		return {
			all: () => ApptSlots.findAll({ where: query }),
			one: () => ApptSlots.findOne({ where: query }),
		};
	},
	getVacantSlots(apptId: number) {
		return ApptSlots.findAll({ where: { recordId: { [Op.eq]: 0 }, apptId } });
	},
	bulkUpdateRecordIdByIntervalBorders: async (query: Partial<ApptSlotsT>, timeInterval: [Date, Date], transaction?: Transaction) => {
		const test = await ApptSlots.update(query, { where: { time: { [Op.between]: timeInterval } }, transaction },)

		return test
	},
	destroy: (query: Partial<ApptSlots>) => ApptSlots.destroy({ where: query })
};
