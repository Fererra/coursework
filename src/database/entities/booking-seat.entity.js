import { EntitySchema } from "typeorm";
import { BookingSeatStatus } from "../../modules/booking/booking-seat-status.js";

export const BookingSeatEntity = new EntitySchema({
  name: "BookingSeat",
  tableName: "booking_seat",
  columns: {
    bookingSeatId: {
      name: "booking_seat_id",
      type: "int",
      primary: true,
      generated: "increment",
    },
    showtimeId: {
      name: "showtime_id",
      type: "int",
      nullable: false,
    },
    seatId: {
      name: "seat_id",
      type: "int",
      nullable: false,
    },
    bookingId: {
      name: "booking_id",
      type: "int",
      nullable: false,
    },
    tariffId: {
      name: "tariff_id",
      type: "int",
      nullable: false,
    },
    finalPrice: {
      name: "final_price",
      type: "decimal",
      precision: 7,
      scale: 2,
      nullable: false,
    },
    status: {
      type: "enum",
      enum: Object.values(BookingSeatStatus),
      default: BookingSeatStatus.ACTIVE,
    },
    createdAt: {
      name: "created_at",
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      name: "updated_at",
      type: "timestamp",
      updateDate: true,
    },
  },
  checks: [{ expression: "final_price > 0" }],
  indices: [
    {
      name: "partial_unique_showtime_seat",
      unique: true,
      columns: ["showtimeId", "seatId"],
      where: `"status" = '${BookingSeatStatus.ACTIVE}'`,
    },
  ],
  relations: {
    showtime: {
      type: "many-to-one",
      target: "Showtime",
      joinColumn: { name: "showtime_id" },
    },
    seat: {
      type: "many-to-one",
      target: "Seat",
      joinColumn: { name: "seat_id" },
    },
    booking: {
      type: "many-to-one",
      target: "Booking",
      joinColumn: { name: "booking_id" },
    },
    tariff: {
      type: "many-to-one",
      target: "Tariff",
      joinColumn: { name: "tariff_id" },
    },
  },
});
