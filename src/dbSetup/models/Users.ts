import { Table, Model, Column, DataType } from "sequelize-typescript";
import type { PartialBy } from "@sequelize/utils";

export type UserT = {
	userId: number;
	firstName: string;
	secondName: string;
	username: string | undefined;
	regDate: Date;
};

export type UserCreationT = PartialBy<UserT, "userId" | "regDate">;

@Table({
	timestamps: false,
	createdAt: "regDate",
	tableName: "users",
	modelName: "Users",
})
export default class Users extends Model<UserT, UserCreationT> {
	@Column({
		type: DataType.INTEGER,
		primaryKey: true,
		unique: true,
	})
	declare userId: number;

	@Column({
		type: DataType.STRING,
	})
	declare firstName: string;

	@Column({
		type: DataType.STRING,
	})
	declare secondName: string;

	@Column({
		type: DataType.STRING,
	})
	declare username: string;

	@Column({
		type: DataType.DATE,
	})
	declare regDate: Date;
}
