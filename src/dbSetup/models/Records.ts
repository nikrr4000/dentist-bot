import {
	Table,
	Model,
	Column,
	DataType,
	ForeignKey,
} from "sequelize-typescript";
import type { PartialBy } from "@sequelize/utils";
import Appointments from "./Appointments.js";
import Users from "./Users.js";
import Procedures from "./Procedures.js";
import type { PaymentStatusesT } from "#types/shared.types.js";

export type RecordT = {
	id: number;
	apptId: number;
	userId: number;
	procedureId: number;
	start: Date;
	end: Date;
	paid: PaymentStatusesT;
};

export type RecordCreationT = PartialBy<RecordT, "id" | "paid">;

@Table({
	timestamps: false,
	tableName: "records",
	modelName: "Records",
})
export default class Records extends Model<RecordT, RecordCreationT> {
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		primaryKey: true,
		unique: true,
	})
	declare id: number;

	@ForeignKey(() => Appointments)
	@Column({
		type: DataType.INTEGER,
	})
	declare apptId: number;

	@ForeignKey(() => Users)
	@Column({
		type: DataType.INTEGER,
	})
	declare userId: number;

	@ForeignKey(() => Procedures)
	@Column({
		type: DataType.INTEGER,
	})
	declare procedureId: number;

	@Column({
		type: DataType.DATE,
	})
	declare start: Date;

	@Column({
		type: DataType.DATE,
	})
	declare end: Date;

	@Column({
		type: DataType.STRING,
		defaultValue: "pending",
	})
	declare paid: PaymentStatusesT;
}
