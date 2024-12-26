import type { loggerLevelsType } from "#types/shared.types.js";
import logger from "#root/logger.js";

export default (err: unknown, logLevel: loggerLevelsType, context: string) => {
  const error = err as Error;
  logger[logLevel](`${context}: \n${error.message}\n${error.stack}`);
  throw new Error(error.message);
};
