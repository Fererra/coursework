import Joi from "joi";
import { SeatType } from "../../cinema-hall/seat-type.js";

export const createCinemaHallDto = Joi.object({
  hallNumber: Joi.number().integer().min(1).required(),
  capacity: Joi.number().integer().min(1).required(),
  seats: Joi.array()
    .items(
      Joi.object({
        rowNumber: Joi.number().integer().min(1).required(),
        seatNumber: Joi.number().integer().min(1).required(),
        seatType: Joi.string()
          .valid(...Object.values(SeatType))
          .required(),
        basePrice: Joi.number().precision(2).positive().required(),
      })
    )
    .required(),
});
