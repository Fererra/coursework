import Joi from "joi";

export const createShowtimeDto = Joi.object({
  hallId: Joi.number().integer().positive().required(),
  movieId: Joi.number().integer().positive().required(),
  showDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  showTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .required(),
});
