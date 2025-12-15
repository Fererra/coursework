import Joi from "joi";

export const createMovieDto = Joi.object({
  title: Joi.string().max(255).required(),
  ageLimit: Joi.number().integer().min(0).required(),
  durationMin: Joi.number().integer().positive().required(),
  releaseYear: Joi.number().integer().min(0).required(),
  description: Joi.string().optional(),
  genreIds: Joi.array().items(Joi.number().integer().positive()).optional(),
});