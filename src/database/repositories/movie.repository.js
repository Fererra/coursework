import AppDataSource from "../data-source.js";
import { MovieErrorMessages } from "../../modules/movie/movie.errors.js";
import { In } from "typeorm";
import { handleDatabaseError } from "../../common/utils/db-errors.js";
import { GenreErrorMessages } from "../../modules/genre/genre.errors.js";

class MovieRepository {
  #repo;
  #dataSource;

  constructor(dataSource) {
    this.#repo = dataSource.getRepository("Movie");
    this.#dataSource = dataSource;
  }

  async getAllMovies(page, pageSize) {
    return this.#repo
      .createQueryBuilder("movie")
      .select([
        "movie.movieId",
        "movie.title",
        "movie.ageLimit",
        "movie.durationMin",
        "movie.releaseYear",
      ])
      .where("movie.deletedAt IS NULL")
      .orderBy("movie.title", "ASC")
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  }

  getMovieDetails(movieId) {
    return this.#repo
      .createQueryBuilder("movie")
      .leftJoinAndSelect("movie.genres", "genres", "genres.deletedAt IS NULL")
      .select([
        "movie.movieId",
        "movie.title",
        "movie.ageLimit",
        "movie.durationMin",
        "movie.releaseYear",
        "movie.description",
        "genres.genreId",
        "genres.name",
      ])
      .where("movie.movieId = :movieId", { movieId })
      .andWhere("movie.deletedAt IS NULL")
      .getOne();
  }

  async createMovie(data) {
    try {
      return await this.#dataSource.transaction(async (manager) => {
        const { genreIds, ...movieData } = data;

        const movie = manager.create("Movie", movieData);

        if (genreIds && genreIds.length > 0) {
          const genres = await manager.find("Genre", {
            where: { genreId: In(genreIds) },
          });

          if (genres.length !== genreIds.length) {
            throw new Error(GenreErrorMessages.SOME_GENRES_NOT_FOUND);
          }

          movie.genres = genres;
        }

        return await manager.save("Movie", movie);
      });
    } catch (error) {
      handleDatabaseError(error, MovieErrorMessages.MOVIE_ALREADY_EXISTS);
    }
  }

  async updateMovie(movieId, updateData) {
    try {
      return this.#dataSource.transaction(async (manager) => {
        const { genreIds, ...movieUpdateData } = updateData;

        const movie = await manager.findOne("Movie", {
          select: [
            "movieId",
            "title",
            "ageLimit",
            "durationMin",
            "releaseYear",
            "description",
          ],
          where: { movieId, deletedAt: null },
          lock: { mode: "pessimistic_write" },
        });

        if (!movie) {
          throw new Error(MovieErrorMessages.MOVIE_NOT_FOUND);
        }

        Object.assign(movie, movieUpdateData);

        if (genreIds && genreIds.length > 0) {
          const genres = await manager.find("Genre", {
            where: { genreId: In(genreIds), deletedAt: null },
          });

          if (genres.length !== genreIds.length) {
            throw new Error(GenreErrorMessages.SOME_GENRES_NOT_FOUND);
          }

          movie.genres = genres;
        }

        return await manager.save("Movie", movie);
      });
    } catch (error) {
      handleDatabaseError(error, MovieErrorMessages.MOVIE_ALREADY_EXISTS);
    }
  }

  async deleteMovie(movieId) {
    return this.#dataSource.transaction(async (manager) => {
      const movie = await manager.findOne("Movie", {
        where: { movieId, deletedAt: null },
        lock: { mode: "pessimistic_write" },
      });

      if (!movie) throw new Error(MovieErrorMessages.MOVIE_NOT_FOUND);

      const showtimesCount = await manager.count("Showtime", {
        where: { movieId, deletedAt: null },
      });

      if (showtimesCount > 0) {
        throw new Error(MovieErrorMessages.MOVIE_DELETE_ERROR);
      }

      await manager.softDelete("Movie", { movieId });

      return { message: "Movie deleted successfully" };
    });
  }
}

export const movieRepository = new MovieRepository(AppDataSource);