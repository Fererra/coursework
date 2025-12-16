import { buildPaginationResponse } from "../../common/utils/pagination.util.js";
import { movieRepository } from "./../../database/repositories/movie.repository.js";
import { MovieErrorMessages } from "./movie.errors.js";

class MovieService {
  #movieRepository;

  constructor(movieRepository) {
    this.#movieRepository = movieRepository;
  }

  async getAllMovies(page, pageSize) {
    const [movies, total] = await this.#movieRepository.getAllMovies(
      page,
      pageSize
    );

    return buildPaginationResponse(movies, total, page, pageSize);
  }

  async getMovieDetails(movieId) {
    const movieDetails = await this.#movieRepository.getMovieDetails(movieId);

    if (!movieDetails) {
      throw new Error(MovieErrorMessages.MOVIE_NOT_FOUND);
    }

    return movieDetails;
  }

  createMovie(data) {
    return this.#movieRepository.createMovie(data);
  }

  updateMovie(movieId, updateData) {
    return this.#movieRepository.updateMovie(movieId, updateData);
  }

  deleteMovie(movieId) {
    return this.#movieRepository.deleteMovie(movieId);
  }
}

export const movieService = new MovieService(movieRepository);