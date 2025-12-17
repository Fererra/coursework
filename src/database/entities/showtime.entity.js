import { EntitySchema } from "typeorm";

export const ShowtimeEntity = new EntitySchema({
  name: "Showtime",
  tableName: "showtime",
  columns: {
    showtimeId: {
      name: "showtime_id",
      primary: true,
      type: "int",
      generated: "increment",
    },
    hallId: {
      name: "hall_id",
      type: "int",
      nullable: false,
    },
    movieId: {
      name: "movie_id",
      type: "int",
      nullable: false,
    },
    showDate: {
      name: "show_date",
      type: "date",
      nullable: false,
    },
    showTime: {
      name: "show_time",
      type: "time",
      nullable: false,
    },
    tariffId: {
      name: "tariff_id",
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
  uniques: [{ columns: ["hallId", "showDate", "showTime"] }],
  indices: [
    {
      name: "idx_showtime_movie_id",
      columns: ["movieId"],
      where: '"deleted_at" IS NULL',
    },
    {
      name: "idx_showtime_hall_id",
      columns: ["hallId"],
      where: '"deleted_at" IS NULL',
    },
  ],
  relations: {
    movie: {
      type: "many-to-one",
      target: "Movie",
      joinColumn: { name: "movie_id" },
    },
    hall: {
      type: "many-to-one",
      target: "CinemaHall",
      joinColumn: { name: "hall_id" },
    },
    tariff: {
      type: "many-to-one",
      target: "Tariff",
      joinColumn: { name: "tariff_id" },
    },
    bookings: {
      type: "one-to-many",
      target: "Booking",
      inverseSide: "showtime",
    },
    seats: {
      type: "one-to-many",
      target: "BookingSeat",
      inverseSide: "showtime",
    },
  },
});
