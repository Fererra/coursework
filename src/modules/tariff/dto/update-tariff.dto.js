import { createTariffDto } from "./create-tariff.dto.js";

export const updateTariffDto = createTariffDto
  .fork(Object.keys(createTariffDto.describe().keys), (schema) =>
    schema.optional()
  )
  .min(1);