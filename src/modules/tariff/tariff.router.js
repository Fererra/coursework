import { Router } from "express";
import { createTariffDto } from "./dto/create-tariff.dto.js";
import { updateTariffDto } from "./dto/update-tariff.dto.js";
import { idSchema } from "../../common/validation/id.schema.js";
import { tariffService } from "./tariff.service.js";
import { TariffErrorMessages } from "./tariff.errors.js";

const tariffRouter = Router();

tariffRouter.get("/", async (_req, res) => {
  try {
    const tariffs = await tariffService.getAllTariffs();
    return res.json(tariffs);
  } catch (error) {
    handleError(res, error);
  }
});

tariffRouter.post("/", async (req, res) => {
  try {
    const tariffData = await createTariffDto.validateAsync(req.body, {
      stripUnknown: true,
    });

    const newTariff = await tariffService.createTariff(tariffData);
    return res.status(201).json(newTariff);
  } catch (error) {
    handleError(res, error);
  }
});

tariffRouter.patch("/:id", async (req, res) => {
  try {
    const tariffId = await idSchema("tariffId").validateAsync(req.params.id);
    const updateData = await updateTariffDto.validateAsync(req.body, {
      stripUnknown: true,
    });

    const updatedTariff = await tariffService.updateTariff(
      tariffId,
      updateData
    );
    return res.json(updatedTariff);
  } catch (error) {
    handleError(res, error);
  }
});

tariffRouter.delete("/:id", async (req, res) => {
  try {
    const tariffId = await idSchema("tariffId").validateAsync(req.params.id);

    const message = await tariffService.deleteTariff(tariffId);
    return res.json(message);
  } catch (error) {
    handleError(res, error);
  }
});

const handleError = (res, error) => {
  const statusMap = {
    [TariffErrorMessages.TARIFF_NOT_FOUND]: 404,
    [TariffErrorMessages.TARIFF_ALREADY_EXISTS]: 409,
  };

  if (error.isJoi) return res.status(400).json({ error: error.message });

  const status = statusMap[error.message] || 500;
  return res.status(status).json({ error: error.message });
};

export default tariffRouter;
