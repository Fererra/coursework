import { genreRepository } from "../../database/repositories/genre.repository.js";
import { handleDatabaseError } from "../../common/utils/db-errors.js";

class GenreService {
  #genreRepository;

  constructor(genreRepository) {
    this.#genreRepository = genreRepository;
  }

  getAllGenres() {
    return this.#genreRepository.getAllGenres();
  }

  async createGenre(data) {
    try {
      return await this.#genreRepository.createGenre(data);
    } catch (error) {
      handleDatabaseError(error, GenreErrorMessages.GENRE_ALREADY_EXISTS);
    }
  }

  async updateGenre(genreId, updateData) {
    try {
      return await this.#genreRepository.updateGenre(genreId, updateData);
    } catch (error) {
      handleDatabaseError(error, GenreErrorMessages.GENRE_ALREADY_EXISTS);
    }
  }

  deleteGenre(genreId) {
    return this.#genreRepository.deleteGenre(genreId);
  }
}

export const genreService = new GenreService(genreRepository);
