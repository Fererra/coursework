import Joi from "joi";

export const idSchema = (name = "id") =>
  Joi.number().integer().positive().required().label(name);
