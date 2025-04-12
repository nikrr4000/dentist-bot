import Users, { type UserCreationT, type UserT } from "#db/models/Users.js";

export default {
	update(filterQuery: Partial<UserT>, updateQuery: Partial<UserT>) {
		return Users.update(updateQuery, { where: filterQuery })
	},
	create(query: UserCreationT) {
		return Users.create(query);
	},
	find(query?: Partial<UserT>) {
		return {
			all: () => Users.findAll({ where: query }),
			one: () => Users.findOne({ where: query }),
		};
	},
	findBatchByIds: (userIds: number[]) => Users.findAll({ where: { userId: userIds } }),
	setApptSub: (userId: number, value: boolean) => Users.update({ newApptsSub: value }, { where: { userId } }),
};
