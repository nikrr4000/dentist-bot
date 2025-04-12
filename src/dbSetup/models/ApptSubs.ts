import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import type { PartialBy } from "@sequelize/utils";
import Users from "./Users.js";
import Procedures from "./Procedures.js";

export type SubT = {
    id: number;
    userId: number;
    procedureId: number;
};

export type SubCreationT = PartialBy<SubT, "id" | "procedureId">

@Table({
    timestamps: false,
    tableName: "appt_subs",
    modelName: "ApptSubs",
})
export default class ApptSubs extends Model<SubT, SubCreationT> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare id: number;

    @ForeignKey(() => Users)
    @Column({
        type: DataType.BIGINT,
    })
    declare userId: number;

    @ForeignKey(() => Procedures)
    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    declare procedureId: number;
}
