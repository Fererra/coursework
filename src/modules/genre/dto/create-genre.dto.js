import Joi from "joi";

export const createGenreDto = Joi.object({
  name: Joi.string().required(),
});
