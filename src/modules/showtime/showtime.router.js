import { Router } from "express";
import { showtimeService } from "./showtime.service.js";
import { ShowtimeErrorMessages } from "./showtime.errors.js";
import { createShowtimeDto } from "./dto/create-showtime.dto.js";
import { updateShowtimeDto } from "./dto/update-showtime.dto.js";
import { bookSeatsDto } from "./dto/book-seats.dto.js";
import { idSchema } from "../../common/validation/id.schema.js";
import { paginationSchema } from "../../common/validation/pagination.schema.js";

const showtimeRouter = Router();

showtimeRouter.get("/", async (_req, res) => {
  try {
    const showtimes = await showtimeService.getAllShowtimes();
    return res.json(showtimes);
  } catch (error) {
    handleError(res, error);
  }
});

showtimeRouter.get("/:id/seats", async (req, res) => {
  try {
    const showtimeId = await idSchema("showtimeId").validateAsync(
      req.params.id
    );

    const seats = await showtimeService.getHallPlan(showtimeId);
    res.json(seats);
  } catch (error) {
    handleError(res, error);
  }
});

showtimeRouter.get("/:id/bookings", async (req, res) => {
  try {
    const showtimeId = await idSchema("showtimeId").validateAsync(
      req.params.id
    );

    const { page, pageSize } = await paginationSchema.validateAsync(req.query);

    const bookings = await showtimeService.getBookings(
      showtimeId,
      page,
      pageSize
    );
    res.json(bookings);
  } catch (error) {
    handleError(res, error);
  }
});

showtimeRouter.post("/:id/bookings", async (req, res) => {
  try {
    const showtimeId = await idSchema("showtimeId").validateAsync(
      req.params.id
    );

    const { seats, userId } = await bookSeatsDto.validateAsync(req.body, {
      stripUnknown: true,
    });

    const bookings = await showtimeService.bookSeats(showtimeId, seats, userId);
    res.json(bookings);
  } catch (error) {
    handleError(res, error);
  }
});

showtimeRouter.get("/:id", async (req, res) => {
  try {
    const showtimeId = await idSchema("showtimeId").validateAsync(
      req.params.id
    );

    const seats = await showtimeService.getShowtimeDetails(showtimeId);
    res.json(seats);
  } catch (error) {
    handleError(res, error);
  }
});

showtimeRouter.post("/", async (req, res) => {
  try {
    const showtimeData = await createShowtimeDto.validateAsync(req.body, {
      stripUnknown: true,
    });

    const newShowtime = await showtimeService.createShowtime(showtimeData);
    return res.json(newShowtime);
  } catch (error) {
    handleError(res, error);
  }
});

showtimeRouter.patch("/:id", async (req, res) => {
  try {
    const showtimeId = await idSchema("showtimeId").validateAsync(
      req.params.id
    );

    const updateData = await updateShowtimeDto.validateAsync(req.body, {
      stripUnknown: true,
    });

    const updatedShowtime = await showtimeService.updateShowtime(
      showtimeId,
      updateData
    );

    return res.json(updatedShowtime);
  } catch (error) {
    handleError(res, error);
  }
});

showtimeRouter.delete("/:id", async (req, res) => {
  try {
    const showtimeId = await idSchema("showtimeId").validateAsync(
      req.params.id
    );

    const message = await showtimeService.deleteShowtime(showtimeId);
    return res.json(message);
  } catch (error) {
    handleError(res, error);
  }
});

const handleError = (res, error) => {
  const statusMap = {
    [ShowtimeErrorMessages.SHOWTIME_NOT_FOUND]: 404,
    [ShowtimeErrorMessages.SHOWTIME_ALREADY_EXISTS]: 409,
    [ShowtimeErrorMessages.SHOWTIME_UPDATE_ERROR]: 400,
    [ShowtimeErrorMessages.SHOWTIME_IN_PAST]: 400,
    [ShowtimeErrorMessages.SHOWTIME_DELETE_ERROR]: 400,
  };

  if (error.isJoi) return res.status(400).json({ error: error.message });

  const status = statusMap[error.message] || 500;
  return res.status(status).json({ error: error.message });
};

export default showtimeRouter;
