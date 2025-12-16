import AppDataSource from "../data-source.js";
import { GenreErrorMessages } from "../../modules/genre/genre.errors.js";

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

  createGenre(data) {
    return this.#repo.save(data);
  }

  updateGenre(genreId, updateData) {
    return this.#dataSource.transaction(async (manager) => {
      const genre = await manager.findOne("Genre", {
        where: { genreId, deletedAt: null },
        lock: { mode: "pessimistic_write" },
      });

      if (!genre) throw new Error(GenreErrorMessages.GENRE_NOT_FOUND);

      Object.assign(genre, updateData);

      return manager.save("Genre", genre);
    });
  }

  deleteGenre(genreId) {
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
