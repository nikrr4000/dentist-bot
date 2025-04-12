import proceduresCtrl from "#db/handlers/proceduresCtrl.js";
import type { ProcedureT } from "#db/models/Procedures.js";
import { keyboardFromData } from "#helpers/index.js";

const proceduresInfoManager = {
	getProceduresNamesMap: async () => {
		const procedures = await proceduresCtrl.find().all()
		return procedures.reduce((acc, el) => {
			acc.set(el.id, el.name)
			return acc
		}, new Map<number, string>())
	},
	getProcedureName: (id: number) => proceduresCtrl.find({ id }).one(),
	getProceduresDescrList: async () => {
		const descriptions = await proceduresCtrl.find().all()
		const list = descriptions.map(procedure => `⚫️<b>${procedure.name}</b> — ${procedure.details} — <b>${procedure.cost}</b>`).join('\n')

		return list
	}
};

const proceduresKManager = {
	getProcedureButtonText: (procedure: ProcedureT) => procedure.name,
	// TODO: add path and action params
	getProcedureButtonLabel: (procedure: ProcedureT) => `${procedure.name}__${procedure.id}`,
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
