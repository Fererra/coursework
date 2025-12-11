import AppDataSource from "../data-source.js";
import { GenreErrorMessages } from "../../genre/genre.errors.js";

class GenreRepository {
  #repo;
  #dataSource;

  constructor(dataSource) {
    this.#repo = dataSource.getRepository("Genre");
    this.#dataSource = dataSource;
  }

  getAllGenres() {
    return this.#repo.find({
      select: ["genreId", "name"],
      where: { deletedAt: null },
    });
  }

  async createGenre(data) {
    return this.#dataSource.transaction(async (manager) => {
      try {
        const genre = manager.create("Genre", data);
        return manager.save("Genre", genre);
      } catch (error) {
        if (error.code === "23505") {
          throw new Error(GenreErrorMessages.GENRE_ALREADY_EXISTS);
        }
        throw error;
      }
    });
  }

  async updateGenre(genreId, updateData) {
    return this.#dataSource.transaction(async (manager) => {
      const genre = await manager.findOne("Genre", {
        select: ["genreId", "name"],
        where: { genreId, deletedAt: null },
      });

      if (!genre) {
        throw new Error(GenreErrorMessages.GENRE_NOT_FOUND);
      }

      Object.assign(genre, updateData);

      try {
        return manager.save("Genre", genre);
      } catch (error) {
        if (error.code === "23505") {
          throw new Error(GenreErrorMessages.GENRE_ALREADY_EXISTS);
        }
        throw error;
      }
    });
  }

  async deleteGenre(genreId) {
    return this.#dataSource.transaction(async (manager) => {
      const genre = await manager.findOne("Genre", {
        where: { genreId, deletedAt: null },
      });

      if (!genre) throw new Error(GenreErrorMessages.GENRE_NOT_FOUND);

      await manager.softDelete("Genre", { genreId });

      return { message: "Genre deleted successfully" };
    });
  }
}

export const genreRepository = new GenreRepository(AppDataSource);
