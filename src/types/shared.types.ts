import type { AppointmentT } from "#db/models/Appointments.js";
import type { SubT } from "#db/models/ApptSubs.js";
import type { ProcedureT } from "#db/models/Procedures.js";
import type { RecordT } from "#db/models/Records.js";
import type { UserT } from "#db/models/Users.js";

export type Config = Record<
	| "BOT_API_TOKEN"
	| "ADMIN_IDS"
	| "SERVICE_GROUP_ID"
	| "ERROR_TOPIC"
	| "INFO_TOPIC"
	| "NEW_RECORDS_TOPIC"
	| "DB_NAME"
	| "DB_USERNAME"
	| "DB_PASSWORD"
	| "DB_HOST"
	| "DB_PORT",
	string
>;

export type RecordProcedureT = RecordT & AppointmentT & { Procedure: ProcedureT }
export type RecordAppointmentProcedureT = RecordProcedureT & { Appointment: AppointmentT }
export
	type basicCallbackArgs = ['user' | 'admin', string | undefined, string | undefined]
export type PaymentStatusesT = "pending" | "paid" | "confirmed";

export type infoUnitPathsType = "who" | "where" | "when";

export type settingsDataT = {
	user: UserT;
	userSubs: SubT[]
}

export type loggerLevelsType =
	| "fatal"
	| "error"
	| "warn"
	| "info"
	| "debug"
	| "trace";

export type operationLog = {
	status: 'ok' | Error,
	details: undefined | string
}

export type createOperationLog<T, K> = operationLog & {
	firstOp: T | undefined,
	secondOp: K | undefined
}

export type taskT = {
	expression: string;
	task: () => Promise<void>;
}

export type dataStructure = {
	path: string, action: string, mode: string, pathId: number, userId?: number
}