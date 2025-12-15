import { createMovieDto } from "./create-movie.dto.js";

export const updateMovieDto = createMovieDto
  .fork(Object.keys(createMovieDto.describe().keys), (schema) =>
    schema.optional()
  )
  .min(1);