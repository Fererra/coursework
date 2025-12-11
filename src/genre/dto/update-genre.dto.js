import { createGenreDto } from "./create-genre.dto.js";

export const updateGenreDto = createGenreDto
  .fork(Object.keys(createGenreDto.describe().keys), (schema) =>
    schema.optional()
  )
  .min(1);
