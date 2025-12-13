import Joi from "joi";

export const bookSeatsDto = Joi.object({
  userId: Joi.number().integer().positive().required(),
  seats: Joi.array()
    .items(Joi.number().integer().positive().required())
    .min(1)
    .required(),
});
