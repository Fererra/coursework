import { signUpDto } from "../../auth/dto/sign-up.dto.js";

const keysToUpdate = Object.keys(signUpDto.describe().keys).filter(
  (key) => key !== "password"
);

export const updateUserDto = signUpDto
  .fork(keysToUpdate, (schema) => schema.optional())
  .fork(["password"], (schema) => schema.forbidden())
  .min(1);