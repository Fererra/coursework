import { Router } from "express";
import { idSchema } from "../id.schema.js";
import { bookingService } from "./booking.service.js";
import { BookingErrorMessages } from "./booking.errors.js";

const bookingRouter = Router();

bookingRouter.get("/:id", async (req, res) => {
  try {
    const bookingId = await idSchema("bookingId").validateAsync(req.params.id);

    const booking = await bookingService.getBookingById(bookingId);
    return res.json(booking);
  } catch (error) {
    handleError(res, error);
  }
});

bookingRouter.delete("/:id", async (req, res) => {
  try {
    const bookingId = await idSchema("bookingId").validateAsync(req.params.id);

    const message = await bookingService.cancelBooking(bookingId);
    return res.json(message);
  } catch (error) {
    handleError(res, error);
  }
});

const handleError = (res, error) => {
  const statusMap = {
    [BookingErrorMessages.BOOKING_NOT_FOUND]: 404,
  };

  if (error.isJoi) return res.status(400).json({ error: error.message });

  const status = statusMap[error.message] || 500;
  return res.status(status).json({ error: error.message });
};

export default bookingRouter;
