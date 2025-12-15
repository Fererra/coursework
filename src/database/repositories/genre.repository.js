import AppDataSource from "../data-source.js";
import { GenreErrorMessages } from "../../modules/genre/genre.errors.js";
import { handleDatabaseError } from "../../common/utils/db-errors.js";

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
    try {
      return await this.#repo.save(data);
    } catch (error) {
      handleDatabaseError(error, GenreErrorMessages.GENRE_ALREADY_EXISTS);
    }
  }

  async updateGenre(genreId, updateData) {
    try {
      return await this.#dataSource.transaction(async (manager) => {
        const genre = await manager.findOne("Genre", {
          where: { genreId, deletedAt: null },
          lock: { mode: "pessimistic_write" },
        });

        if (!genre) throw new Error(GenreErrorMessages.GENRE_NOT_FOUND);

        Object.assign(genre, updateData);

        return await manager.save("Genre", genre);
      });
    } catch (error) {
      handleDatabaseError(error, GenreErrorMessages.GENRE_ALREADY_EXISTS);
    }
  }

  async deleteGenre(genreId) {
    return this.#dataSource.transaction(async (manager) => {
      const genre = await manager.findOne("Genre", {
        where: { genreId, deletedAt: null },
        lock: { mode: "pessimistic_write" },
      });

      if (!genre) throw new Error(GenreErrorMessages.GENRE_NOT_FOUND);

      await manager.softDelete("Genre", { genreId });

      return { message: "Genre deleted successfully" };
    });
  }
}

export const genreRepository = new GenreRepository(AppDataSource);
