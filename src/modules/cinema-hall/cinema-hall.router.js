import { Router } from "express";
import { createCinemaHallDto } from "./dto/create-cinema-hall.dto.js";
import { updateCinemaHallDto } from "./dto/update-cinema-hall.dto.js";
import { idSchema } from "../../common/validation/id.schema.js";
import { cinemaHallService } from "./cinema-hall.service.js";
import { CinemaHallErrorMessages } from "./cinema-hall.errors.js";

const cinemaHallRouter = Router();

cinemaHallRouter.get("/", async (_req, res) => {
  try {
    const cinemaHalls = await cinemaHallService.getAllCinemaHalls();
    return res.json(cinemaHalls);
  } catch (error) {
    handleError(res, error);
  }
});

cinemaHallRouter.get("/:id", async (req, res) => {
  try {
    const cinemaHallId = await idSchema("cinemaHallId").validateAsync(
      req.params.id
    );

    const cinemaHall = await cinemaHallService.getCinemaHallDetails(
      cinemaHallId
    );
    return res.json(cinemaHall);
  } catch (error) {
    handleError(res, error);
  }
});

cinemaHallRouter.post("/", async (req, res) => {
  try {
    const cinemaHallData = await createCinemaHallDto.validateAsync(req.body, {
      stripUnknown: true,
    });

    const newCinemaHall = await cinemaHallService.createCinemaHall(
      cinemaHallData
    );
    return res.status(201).json(newCinemaHall);
  } catch (error) {
    handleError(res, error);
  }
});

cinemaHallRouter.patch("/:id", async (req, res) => {
  try {
    const cinemaHallId = await idSchema("cinemaHallId").validateAsync(
      req.params.id
    );
    const updateData = await updateCinemaHallDto.validateAsync(req.body, {
      stripUnknown: true,
    });

    const updatedCinemaHall = await cinemaHallService.updateCinemaHall(
      cinemaHallId,
      updateData
    );
    return res.json(updatedCinemaHall);
  } catch (error) {
    handleError(res, error);
  }
});

cinemaHallRouter.delete("/:id", async (req, res) => {
  try {
    const cinemaHallId = await idSchema("cinemaHallId").validateAsync(
      req.params.id
    );

    const message = await cinemaHallService.deleteCinemaHall(cinemaHallId);
    return res.json(message);
  } catch (error) {
    handleError(res, error);
  }
});

const handleError = (res, error) => {
  const statusMap = {
    [CinemaHallErrorMessages.CINEMA_HALL_NOT_FOUND]: 404,
    [CinemaHallErrorMessages.CINEMA_HALL_ALREADY_EXISTS]: 409,
    [CinemaHallErrorMessages.CINEMA_HALL_DELETE_ERROR]: 400,
  };

  if (error.isJoi) return res.status(400).json({ error: error.message });

  const status = statusMap[error.message] || 500;
  return res.status(status).json({ error: error.message });
};

export default cinemaHallRouter;
