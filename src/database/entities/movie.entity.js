import { EntitySchema } from "typeorm";

export const MovieEntity = new EntitySchema({
  name: "Movie",
  tableName: "movie",
  columns: {
    movieId: {
      name: "movie_id",
      primary: true,
      type: "int",
      generated: "increment",
    },
    title: {
      type: "varchar",
      length: 255,
      nullable: false,
      unique: true,
    },
    ageLimit: {
      name: "age_limit",
      type: "int",
      nullable: false,
    },
    durationMin: {
      name: "duration_min",
      type: "int",
      nullable: false,
    },
    releaseYear: {
      name: "release_year",
      type: "int",
      nullable: false,
    },
    description: {
      type: "text",
      default: "No description",
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
    { expression: "age_limit > 0" },
    { expression: "duration_min > 0" },
    { expression: "release_year > 0" },
  ],
  relations: {
    genres: {
      type: "many-to-many",
      target: "Genre",
      joinTable: {
        name: "movie_genre",
        joinColumn: { name: "movie_id" },
        inverseJoinColumn: { name: "genre_id" },
      },
    },
    showtimes: {
      type: "one-to-many",
      target: "Showtime",
      inverseSide: "movie",
    },
  },
});
