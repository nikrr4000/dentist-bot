import {
	Table,
	Model,
	Column,
	DataType,
	ForeignKey,
} from "sequelize-typescript";
import type { PartialBy } from "@sequelize/utils";
import Appointments from "./Appointments.js";

export type ApptSlotsT = {
	id: number;
	time: Date;
	recordId: number;
	apptId: number;
};

export type ApptSlotsCreationT = PartialBy<ApptSlotsT, "id" | 'recordId'>;

@Table({
	timestamps: false,
	tableName: "appt-slots",
	modelName: "ApptSlots",
})
export default class ApptSlots extends Model<ApptSlotsT, ApptSlotsCreationT> {
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	})
	declare id: number;

	@Column({
		type: DataType.DATE,
	})
	declare time: Date;

	@Column({
		type: DataType.INTEGER,
		defaultValue: 0,
	})
	declare recordId: number;

	@ForeignKey(() => Appointments)
	@Column({
		type: DataType.INTEGER,
	})
	declare apptId: number;
}
