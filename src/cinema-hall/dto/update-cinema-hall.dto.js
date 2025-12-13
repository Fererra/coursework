import Joi from "joi";
import { SeatType } from "../../seat-type.js";

export const updateCinemaHallDto = Joi.object({
  hallNumber: Joi.number().integer().min(1).optional(),
  capacity: Joi.number().integer().min(1).optional(),
  seats: Joi.array()
    .items(
      Joi.object({
        seatId: Joi.number().integer().min(1).optional(),
        rowNumber: Joi.number().integer().min(1).required(),
        seatNumber: Joi.number().integer().min(1).required(),
        seatType: Joi.string()
          .valid(...Object.values(SeatType))
          .required(),
        basePrice: Joi.number().precision(2).positive().required(),
        deleted: Joi.boolean().optional(),
      })
    )
    .optional(),
}).min(1);