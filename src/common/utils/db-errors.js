import { PG_ERROR_CODES } from "../constants/pg-error-codes.js";

export function handleDatabaseError(error, message) {
  if (error?.code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
    throw new Error(message);
  }
  throw error;
}
