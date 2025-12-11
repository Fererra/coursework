import { Router } from "express";
import { idSchema } from "../id.schema.js";
import { createMovieDto } from "./dto/create-movie.dto.js";
import { updateMovieDto } from "./dto/update-movie.dto.js";
import { movieService } from "./movie.service.js";
import { MovieErrorMessages } from "./movie.errors.js";

const movieRouter = Router();

movieRouter.get("/", async (_req, res) => {
  try {
    const movies = await movieService.getAllMovies();
    return res.json(movies);
  } catch (error) {
    handleError(res, error);
  }
});

movieRouter.get("/:id", async (req, res) => {
  try {
    const movieId = await idSchema("movieId").validateAsync(req.params.id);

    const movie = await movieService.getMovieDetails(movieId);
    return res.json(movie);
  } catch (error) {
    handleError(res, error);
  }
});

movieRouter.post("/", async (req, res) => {
  try {
    const movieData = await createMovieDto.validateAsync(req.body, {
      stripUnknown: true,
    });

    const newMovie = await movieService.createMovie(movieData);
    return res.status(201).json(newMovie);
  } catch (error) {
    handleError(res, error);
  }
});

movieRouter.patch("/:id", async (req, res) => {
  try {
    const movieId = await idSchema("movieId").validateAsync(req.params.id);
    const updateData = await updateMovieDto.validateAsync(req.body, {
      stripUnknown: true,
    });

    const updatedMovie = await movieService.updateMovie(movieId, updateData);
    return res.json(updatedMovie);
  } catch (error) {
    handleError(res, error);
  }
});

movieRouter.delete("/:id", async (req, res) => {
  try {
    const movieId = await idSchema("movieId").validateAsync(req.params.id);

    const message = await movieService.deleteMovie(movieId);
    return res.json(message);
  } catch (error) {
    handleError(res, error);
  }
});

const handleError = (res, error) => {
  const statusMap = {
    [MovieErrorMessages.MOVIE_NOT_FOUND]: 404,
    [MovieErrorMessages.MOVIE_ALREADY_EXISTS]: 409,
  };

  if (error.isJoi) return res.status(400).json({ error: error.message });

  const status = statusMap[error.message] || 500;
  return res.status(status).json({ error: error.message });
};

export default movieRouter;