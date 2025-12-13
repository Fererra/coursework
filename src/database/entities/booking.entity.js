import { EntitySchema } from "typeorm";
import { BookingStatus } from "../../booking/booking-status.js";

export const BookingEntity = new EntitySchema({
  name: "Booking",
  tableName: "booking",
  columns: {
    bookingId: {
      name: "booking_id",
      primary: true,
      type: "int",
      generated: "increment",
    },
    totalPrice: {
      name: "total_price",
      type: "decimal",
      precision: 8,
      scale: 2,
      nullable: false,
    },
    status: {
      type: "enum",
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    bookingDate: {
      name: "booking_date",
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    updatedAt: {
      name: "updated_at",
      type: "timestamp",
      updateDate: true,
    },
  },
  checks: [{ expression: "total_price >= 0" }],
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
    },
    showtime: {
      type: "many-to-one",
      target: "Showtime",
      joinColumn: { name: "showtime_id" },
    },
    seats: {
      type: "one-to-many",
      target: "BookingSeat",
      inverseSide: "booking",
    },
  },
});
