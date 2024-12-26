import proceduresCtrl from "#db/handlers/proceduresCtrl.js";
import type { ProcedureT } from "#db/models/Procedures.js";
import { keyboardFromData } from "./keyboardUtils.js";

const proceduresInfoManager = {
	getProceduresNamesMap: async () => {
		const procedures = await proceduresCtrl.find().all()
		return procedures.reduce((acc, el) => {
			acc.set(el.id, el.name)
			return acc
		}, new Map<number, string>())
	}
};

const proceduresKManager = {
	getProcedureButtonText: (procedure: ProcedureT) => {
		return procedure.name;
	},
	getProcedureButtonLabel: (procedure: ProcedureT) => {
		// TODO: add path and action params
		return `${procedure.name}__${procedure.id}`;
	},
	async getList() {
		const procedures = await proceduresCtrl.find().all();
		const kButtonData = procedures.map((el) => {
			const text = this.getProcedureButtonText(el);
			const label = this.getProcedureButtonLabel(el);
			return [text, label] as [string, string];
		});
		return keyboardFromData(kButtonData);
	},
};

export { proceduresInfoManager, proceduresKManager };
