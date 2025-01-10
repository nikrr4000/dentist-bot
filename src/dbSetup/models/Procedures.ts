import { Table, Model, Column, DataType } from "sequelize-typescript";
import type { PartialBy } from "@sequelize/utils";

export type ProcedureT = {
	id: number;
	name: string;
	details: string;
	duration: number;
};

export type ProcedureCreationT = PartialBy<ProcedureT, "id">;

@Table({
	timestamps: false,
	tableName: "procedures",
	modelName: "Procedures",
})
export default class Procedures extends Model<ProcedureT, ProcedureCreationT> {
	@Column({
		type: DataType.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		unique: true,
	})
	declare id: number;

	@Column({
		type: DataType.STRING,
	})
	declare name: string;

	@Column({
		type: DataType.STRING,
	})
	declare details: string;

	@Column({
		type: DataType.INTEGER,
	})
	declare duration: number;

	@Column({
		type: DataType.INTEGER,
	})
	declare cost: number
}
