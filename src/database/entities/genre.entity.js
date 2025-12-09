import { EntitySchema } from "typeorm";

export const GenreEntity = new EntitySchema({
  name: "Genre",
  tableName: "genre",
  columns: {
    genreId: {
      name: "genre_id",
      primary: true,
      type: "int",
      generated: "increment",
    },
    name: {
      type: "varchar",
      unique: true,
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
  relations: {
    movies: {
      type: "many-to-many",
      target: "Movie",
      mappedBy: "genres",
    },
  },
});
