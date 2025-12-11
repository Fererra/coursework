import Joi from "joi";

export const loginDto = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});