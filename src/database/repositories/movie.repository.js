import AppDataSource from "../data-source.js";
import { MovieErrorMessages } from "../../modules/movie/movie.errors.js";
import { In } from "typeorm";

class MovieRepository {
  #repo;
  #dataSource;

  constructor(dataSource) {
    this.#repo = dataSource.getRepository("Movie");
    this.#dataSource = dataSource;
  }

  getAllMovies() {
    return this.#repo.find({
      select: ["movieId", "title", "ageLimit", "durationMin", "releaseYear"],
      where: { deletedAt: null },
    });
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
    return this.#dataSource.transaction(async (manager) => {
      try {
        const { genreIds, ...movieData } = data;

        const movie = manager.create("Movie", movieData);
        await manager.save("Movie", movie);

        if (genreIds && genreIds.length > 0) {
          const genres = await manager.find("Genre", {
            where: { genreId: In(genreIds) },
          });

          if (genres.length !== genreIds.length) {
            throw new Error("Some genres not found");
          }

          movie.genres = genres;
          await manager.save("Movie", movie);
        }

        return movie;
      } catch (error) {
        if (error.code === "23505") {
          throw new Error(MovieErrorMessages.MOVIE_ALREADY_EXISTS);
        }
        throw error;
      }
    });
  }

  async updateMovie(movieId, updateData) {
    return this.#dataSource.transaction(async (manager) => {
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
        relations: ["genres"],
      });

      if (!movie) {
        throw new Error(MovieErrorMessages.MOVIE_NOT_FOUND);
      }

      Object.assign(movie, updateData);

      if (updateData.genreIds && updateData.genreIds.length > 0) {
        const genres = await manager.find("Genre", {
          where: { genreId: In(updateData.genreIds) },
        });

        if (genres.length !== updateData.genreIds.length) {
          throw new Error("Some genres not found");
        }

        movie.genres = genres;
      }

      try {
        await manager.save("Movie", movie);
        return movie;
      } catch (error) {
        if (error.code === "23505") {
          throw new Error(MovieErrorMessages.MOVIE_ALREADY_EXISTS);
        }
        throw error;
      }
    });
  }

  async deleteMovie(movieId) {
    return this.#dataSource.transaction(async (manager) => {
      const movie = await manager
        .getRepository("Movie")
        .createQueryBuilder("movie")
        .leftJoinAndSelect(
          "movie.showtimes",
          "showtime",
          "showtime.deletedAt IS NULL"
        )
        .where("movie.movieId = :movieId", { movieId })
        .andWhere("movie.deletedAt IS NULL")
        .getOne();

      if (!movie) throw new Error(MovieErrorMessages.MOVIE_NOT_FOUND);

      if (movie.showtimes.length > 0) {
        throw new Error(MovieErrorMessages.MOVIE_DELETE_ERROR);
      }

      await manager.softDelete("Movie", { movieId });

      return { message: "Movie deleted successfully" };
    });
  }
}

export const movieRepository = new MovieRepository(AppDataSource);
