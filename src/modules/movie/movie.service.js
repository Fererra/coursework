import { buildPaginationResponse } from "../../common/utils/pagination.util.js";
import { movieRepository } from "./../../database/repositories/movie.repository.js";
import { handleDatabaseError } from "../../common/utils/db-errors.js";
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

  async createMovie(data) {
    try {
      return await this.#movieRepository.createMovie(data);
    } catch (error) {
      handleDatabaseError(error, MovieErrorMessages.MOVIE_ALREADY_EXISTS);
    }
  }

  updateMovie(movieId, updateData) {
    try {
      return this.#movieRepository.updateMovie(movieId, updateData);
    } catch (error) {
      handleDatabaseError(error, MovieErrorMessages.MOVIE_ALREADY_EXISTS);
    }
  }

  deleteMovie(movieId) {
    return this.#movieRepository.deleteMovie(movieId);
  }
}

export const movieService = new MovieService(movieRepository);
