import apptSlotsCtrl from "#db/handlers/apptSlotsCtrl.js";
import proceduresCtrl from "#db/handlers/proceduresCtrl.js";
import type { ApptSlotsT } from "#db/models/ApptSlots.js";
import { InlineKeyboard } from "grammy";
import dates from "./dates.js";
import guardExp from "./guardExp.js";

type idsWithText = Map<string, string>;

const slotsServices = (apptId: number) => ({
	async discardRecordSlots(recordId: number) {
		const slots = await apptSlotsCtrl.find({ recordId }).all()
		const [start, end] = [slots.shift(), slots.pop()] as [ApptSlotsT, ApptSlotsT]

		const existingSlot1 = await apptSlotsCtrl.find({ time: start.time })
		const existingSlot2 = await apptSlotsCtrl.find({ time: end.time })

		const promises = await [start, end].map(el => apptSlotsCtrl.destroy({ recordId: 0, time: el.time, apptId: el.apptId }))
		await Promise.all(promises)

		await apptSlotsCtrl.update({ recordId: 0, }, { recordId })
	},
	async getVacantIntervalsBySegmentNum(segmentsNum: number) {
		const slots = await apptSlotsCtrl.getVacantSlots(apptId)

		const timePoints = segmentsNum + 1;
		if (slots.length < segmentsNum) return []

		const sortedSlots = slots.sort((a, b) => a.time.getTime() - b.time.getTime());

		const slotsIntervals: ApptSlotsT[][] = [];
		let tempIntervals: ApptSlotsT[] = [];

		for (let index = 0; index <= sortedSlots.length - timePoints; index++)
		{
			let validSegment = true;

			for (let j = 0; j < timePoints - 1; j++)
			{
				const timeOne = sortedSlots[index + j + 1].time.getTime();
				const timeTwo = sortedSlots[index + j].time.getTime();

				const diff = (timeOne - timeTwo) / (1000 * 60);

				if (diff !== 15)
				{
					validSegment = false;
					break;
				}
			}

			if (validSegment)
			{
				tempIntervals = sortedSlots.slice(index, index + timePoints);
				slotsIntervals.push([tempIntervals.shift(), tempIntervals.pop()] as [ApptSlotsT, ApptSlotsT]);

				index += timePoints - 2; // I suppose 2 is number of borders
			}
		}

		return slotsIntervals;
	},
});

const manageSlotTexts = {
	createIntervalSlotTextWithId(acc: idsWithText, slotBorders: ApptSlotsT[]) {
		const datesArr = slotBorders.map(el => dates.parseApptDate(el.time))
		const timeStr = datesArr.map(el => dates.getStrDateWithoutDate(el)).join(' - ')
		const idsStr = slotBorders.map(el => el.id).join('_')

		acc.set(idsStr, timeStr)
	},
};

const manageApptSlots = (apptId: number) => ({
	async getApptSlotsTextWithId(procedureId: number) {
		const procedure = await proceduresCtrl.find({ id: procedureId }).one();
		guardExp(procedure, "procedure inside getApptSlotsText");
		const segmentNum = procedure.duration;

		const slots =
			await slotsServices(apptId).getVacantIntervalsBySegmentNum(segmentNum);

		const idsWithTextMap: idsWithText = new Map();
		if (slots.length === 0)
		{
			return idsWithTextMap;
		}

		for (const slot of slots)
		{
			manageSlotTexts.createIntervalSlotTextWithId(idsWithTextMap, slot)
		}

		return idsWithTextMap;
	},
});

const manageApptSlotsK = {
	createButtons: (dataMap: idsWithText) => {
		const k = new InlineKeyboard();
		dataMap.forEach((text, ids) => {
			k.text(text, `${text}__${ids}`).row()
		});
		return k;
	},
};

export { slotsServices, manageSlotTexts, manageApptSlots, manageApptSlotsK };
