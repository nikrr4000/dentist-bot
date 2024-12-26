import { Sequelize } from "sequelize-typescript";
import sanitizedConfig from "#root/config.js";
import Appointments from "./models/Appointments.js";
import Procedures from "./models/Procedures.js";
import Records from "./models/Records.js";
import Users from "./models/Users.js";
import ApptSlots from "./models/ApptSlots.js";

export let sequelize: Sequelize;

try
{
	const env = sanitizedConfig;
	const dbObj = {
		database: env.DB_NAME,
		username: env.DB_USERNAME,
		password: env.DB_PASSWORD,
		host: env.DB_HOST,
		port: +env.DB_PORT,
	};

	sequelize = new Sequelize({
		dialect: "postgres",
		logging: false,
		...dbObj,
		models: [Appointments, Procedures, Records, Users, ApptSlots],
	});

	Users.hasMany(Records, { foreignKey: "userId" });
	Appointments.hasMany(Records, { foreignKey: "apptId", onDelete: 'CASCADE' });
	Records.belongsTo(Appointments, { foreignKey: "apptId" });
	Appointments.hasMany(ApptSlots, { foreignKey: "apptId", onDelete: 'CASCADE' });
	Procedures.hasMany(Records, { foreignKey: "procedureId" });
	Records.belongsTo(Procedures, { foreignKey: "procedureId" });
} catch (err)
{
	// logErrorAndThrow(err, "fatal", "can't connect to database");
	console.error("ERROR HAPPENED INITIALIZING DB CLIENT\n", err);
}
