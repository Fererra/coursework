import { createShowtimeDto } from "./create-showtime.dto.js";

export const updateShowtimeDto = createShowtimeDto
  .fork(Object.keys(createShowtimeDto.describe().keys), (schema) =>
    schema.optional()
  )
  .min(1);
