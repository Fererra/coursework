import { Router } from "express";
import { createGenreDto } from "./dto/create-genre.dto.js";
import { updateGenreDto } from "./dto/update-genre.dto.js";
import { idSchema } from "../id.schema.js";
import { genreService } from "./genre.service.js";
import { GenreErrorMessages } from "./genre.errors.js";

const genreRouter = Router();

genreRouter.get("/", async (req, res) => {
  try {
    const genres = await genreService.getAllGenres();
    return res.json(genres);
  } catch (error) {
    handleError(res, error);
  }
});

genreRouter.post("/", async (req, res) => {
  try {
    const genreData = await createGenreDto.validateAsync(req.body, {
      stripUnknown: true,
    });

    const newGenre = await genreService.createGenre(genreData);
    return res.status(201).json(newGenre);
  } catch (error) {
    handleError(res, error);
  }
});

genreRouter.patch("/:id", async (req, res) => {
  try {
    const genreId = await idSchema("genreId").validateAsync(req.params.id);
    const updateData = await updateGenreDto.validateAsync(req.body, {
      stripUnknown: true,
    });

    const updatedGenre = await genreService.updateGenre(genreId, updateData);
    return res.json(updatedGenre);
  } catch (error) {
    handleError(res, error);
  }
});

genreRouter.delete("/:id", async (req, res) => {
  try {
    const genreId = await idSchema("genreId").validateAsync(req.params.id);

    const message = await genreService.deleteGenre(genreId);
    return res.json(message);
  } catch (error) {
    handleError(res, error);
  }
});

const handleError = (res, error) => {
  const statusMap = {
    [GenreErrorMessages.GENRE_NOT_FOUND]: 404,
    [GenreErrorMessages.GENRE_ALREADY_EXISTS]: 409,
  };

  if (error.isJoi) return res.status(400).json({ error: error.message });

  const status = statusMap[error.message] || 500;
  return res.status(status).json({ error: error.message });
};

export default genreRouter;
