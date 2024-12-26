import Procedures, { type ProcedureT } from "#db/models/Procedures.js";

export default {
	find: (query?: Partial<ProcedureT>) => {
		return {
			all: () => Procedures.findAll({ where: query }),
			one: () => Procedures.findOne({ where: query }),
		};
	},
};
