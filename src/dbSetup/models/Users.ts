import { Table, Model, Column, DataType, HasMany } from "sequelize-typescript";
import type { PartialBy } from "@sequelize/utils";
import ApptSubs from "./ApptSubs.js";

export type UserT = {
	userId: number;
	firstName: string;
	secondName: string;
	username: string | undefined;
	regDate: Date;
	newApptsSub: boolean;
	ApptSubs?: ApptSubs[];
};

export type UserCreationT = PartialBy<UserT, "userId" | "regDate" | "newApptsSub">;

@Table({
	timestamps: false,
	createdAt: "regDate",
	tableName: "users",
	modelName: "Users",
})
export default class Users extends Model<UserT, UserCreationT> {
	@Column({
		type: DataType.BIGINT,
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

	@Column({
		type: DataType.BOOLEAN,
		defaultValue: false
	})
	declare newApptsSub: boolean;

	@HasMany(() => ApptSubs)
	declare ApptSubs: ApptSubs[];
}
