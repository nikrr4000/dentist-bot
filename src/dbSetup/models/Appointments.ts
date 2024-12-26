import { Table, Model, Column, DataType } from "sequelize-typescript";
import type { PartialBy } from "@sequelize/utils";

export type AppointmentT = {
	id: number;
	start: Date;
	end: Date;
	place: string;
	ended: boolean;
};

export type AppointmentCreationT = PartialBy<AppointmentT, "id" | "ended">;

@Table({
	timestamps: false,
	tableName: "appointments",
	modelName: "Appointments",
})
export default class Appointments extends Model<
	AppointmentT,
	AppointmentCreationT
> {
	@Column({
		type: DataType.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		unique: true,
	})
	declare id: number;

	@Column({
		type: DataType.DATE,
	})
	declare date: Date;

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
	})
	declare place: string;

	@Column({
		type: DataType.BOOLEAN,
		defaultValue: false,
	})
	declare ended: boolean;
}
