import { genreRepository } from "../../database/repositories/genre.repository.js";

class GenreService {
  #genreRepository;

  constructor(genreRepository) {
    this.#genreRepository = genreRepository;
  }

  getAllGenres() {
    return this.#genreRepository.getAllGenres();
  }

  createGenre(data) {
    return this.#genreRepository.createGenre(data);
  }

  updateGenre(genreId, updateData) {
    return this.#genreRepository.updateGenre(genreId, updateData);
  }

  deleteGenre(genreId) {
    return this.#genreRepository.deleteGenre(genreId);
  }
}

export const genreService = new GenreService(genreRepository);
