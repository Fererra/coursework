import { EntitySchema } from "typeorm";
import { SeatType } from "../../modules/cinema-hall/seat-type.js";

export const SeatEntity = new EntitySchema({
  name: "Seat",
  tableName: "seat",
  columns: {
    seatId: {
      name: "seat_id",
      primary: true,
      type: "int",
      generated: "increment",
    },
    hallId: {
      name: "hall_id",
      type: "int",
      nullable: false,
    },
    rowNumber: {
      name: "row_number",
      type: "int",
      nullable: false,
    },
    seatNumber: {
      name: "seat_number",
      type: "int",
      nullable: false,
    },
    seatType: {
      name: "seat_type",
      type: "enum",
      enum: Object.values(SeatType),
      nullable: false,
    },
    basePrice: {
      name: "base_price",
      type: "decimal",
      precision: 6,
      scale: 2,
      nullable: false,
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
    deletedAt: {
      name: "deleted_at",
      type: "timestamp",
      nullable: true,
      deleteDate: true,
    },
  },
  checks: [
    { expression: "row_number > 0" },
    { expression: "seat_number > 0" },
    { expression: "base_price > 0" },
  ],
  uniques: [
    {
      columns: ["hallId", "rowNumber", "seatNumber"],
    },
  ],
  relations: {
    hall: {
      type: "many-to-one",
      target: "CinemaHall",
      joinColumn: { name: "hall_id" },
    },
    bookings: {
      type: "one-to-many",
      target: "BookingSeat",
      inverseSide: "seat",
    },
  },
});
