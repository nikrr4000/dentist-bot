import Users, { type UserCreationT, type UserT } from "#db/models/Users.js";

export default {
	create(query: UserCreationT) {
		return Users.create(query);
	},
	find(query?: Partial<UserT>) {
		return {
			all: () => Users.findAll({ where: query }),
			one: () => Users.findOne({ where: query }),
		};
	},
};
