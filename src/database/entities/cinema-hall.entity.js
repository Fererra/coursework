import { EntitySchema } from "typeorm";

export const CinemaHallEntity = new EntitySchema({
  name: "CinemaHall",
  tableName: "cinema_hall",
  columns: {
    hallId: {
      name: "hall_id",
      primary: true,
      type: "int",
      generated: "increment",
    },
    hallNumber: {
      name: "hall_number",
      type: "int",
      nullable: false,
      unique: true,
    },
    capacity: {
      type: "int",
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
  checks: [{ expression: "hall_number > 0" }, { expression: "capacity > 0" }],
  relations: {
    seats: {
      type: "one-to-many",
      target: "Seat",
      inverseSide: "hall",
    },
    showtimes: {
      type: "one-to-many",
      target: "Showtime",
      inverseSide: "hall",
    },
  },
});