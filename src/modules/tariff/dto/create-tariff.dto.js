import Joi from "joi";

export const createTariffDto = Joi.object({
  name: Joi.string().required(),
  startTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .required(),
  endTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .required(),
  priceMultiplier: Joi.number().greater(0).precision(2).required(),
});