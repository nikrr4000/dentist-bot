import ApptSubs from "#db/models/ApptSubs.js";
import { Op } from "sequelize";
import Users from "#db/models/Users.js";
import Procedures from "#db/models/Procedures.js";

export type ApptSubWithRelationsT = {
    id: number;
    userId: number;
    procedureId: number;
    User: Users;
    Procedure: Procedures;
};

export default {
    find: (userId: number | number[]) => ApptSubs.findAll({ where: { userId: Array.isArray(userId) ? { [Op.in]: userId } : userId } }),
    findAll: () => ApptSubs.findAll(),
    findAllWithRelations: async () => {
        return ApptSubs.findAll({
            include:
                [{
                    model: Procedures,
                }, {
                    model: Users,
                }],

        }) as unknown as ApptSubWithRelationsT[];
    },
    createSub: (userId: number, procedureId: number) => ApptSubs.create({ userId, procedureId }),
    delete: async (userId: number, procedureId: number) => {
        const matchingSubs = await ApptSubs.findAll({ where: { userId, procedureId } })
        const { id } = matchingSubs[0]
        return ApptSubs.destroy({ where: { id, userId, procedureId } })
    },
    truncate: () => ApptSubs.truncate()
};
