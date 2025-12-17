import request from "supertest";
import AppDataSource from "../../src/database/data-source.js";
import app from "../../src/app.js";

const clearDatabase = async () => {
  const entities = AppDataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = AppDataSource.getRepository(entity.name);
    await repository.query(
      `TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE`
    );
  }
};

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe("Movie API (integration)", () => {
  describe("POST /movies", () => {
    it("creates movie with genres", async () => {
      const genreRes = await AppDataSource.getRepository("Genre").save({
        name: "Action",
      });

      const res = await request(app)
        .post("/movies")
        .send({
          title: "Inception",
          ageLimit: 16,
          durationMin: 148,
          releaseYear: 2010,
          description: "Mind-bending thriller",
          genreIds: [genreRes.genreId],
        });

      expect(res.status).toBe(201);
      expect(res.body.movieId).toBeDefined();
      expect(res.body.title).toBe("Inception");
      expect(res.body.genres).toHaveLength(1);

      const movieInDb = await AppDataSource.getRepository("Movie").findOne({
        where: { movieId: res.body.movieId },
        relations: ["genres"],
      });

      expect(movieInDb).not.toBeNull();
      expect(movieInDb.genres[0].name).toBe("Action");
    });

    it("rollbacks transaction if some genres do not exist", async () => {
      const res = await request(app)
        .post("/movies")
        .send({
          title: "Broken movie",
          ageLimit: 12,
          durationMin: 90,
          releaseYear: 2024,
          genreIds: [999],
        });

      expect(res.status).toBe(400);

      const movies = await AppDataSource.getRepository("Movie").find();

      expect(movies).toHaveLength(0);
    });
  });

  describe("GET /movies", () => {
    it("returns paginated list of movies", async () => {
      await AppDataSource.getRepository("Movie").save([
        {
          title: "Avatar",
          ageLimit: 12,
          durationMin: 160,
          releaseYear: 2009,
          description: "Epic sci-fi movie",
        },
        {
          title: "Batman",
          ageLimit: 16,
          durationMin: 140,
          releaseYear: 2022,
          description: "Superhero action movie",
        },
      ]);

      const res = await request(app).get("/movies?page=1&pageSize=1");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(2);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(1);
    });
  });

  describe("GET /movies/:id", () => {
    it("returns movie details with genres", async () => {
      const genre = await AppDataSource.getRepository("Genre").save({
        name: "Drama",
      });

      const movie = await AppDataSource.getRepository("Movie").save({
        title: "Oppenheimer",
        ageLimit: 16,
        durationMin: 180,
        releaseYear: 2023,
        description: "Historical drama",
        genres: [genre],
      });

      const res = await request(app).get(`/movies/${movie.movieId}`);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Oppenheimer");
      expect(res.body.genres).toHaveLength(1);
      expect(res.body.genres[0].name).toBe("Drama");
    });

    it("returns 404 if movie not found", async () => {
      const res = await request(app).get("/movies/999");

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /movies/:id", () => {
    it("updates movie data", async () => {
      const movie = await AppDataSource.getRepository("Movie").save({
        title: "Old title",
        ageLimit: 12,
        durationMin: 100,
        releaseYear: 2020,
        description: "Some old description",
      });

      const res = await request(app).patch(`/movies/${movie.movieId}`).send({
        title: "New title",
        durationMin: 110,
      });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("New title");
      expect(res.body.durationMin).toBe(110);
    });

    it("returns 404 if movie not found", async () => {
      const res = await request(app)
        .patch("/movies/999")
        .send({ title: "Does not matter" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /movies/:id", () => {
    it("soft deletes movie if no showtimes exist", async () => {
      const movie = await AppDataSource.getRepository("Movie").save({
        title: "Deletable movie",
        ageLimit: 12,
        durationMin: 100,
        releaseYear: 2020,
        description: "Some description",
      });

      const res = await request(app).delete(`/movies/${movie.movieId}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Movie deleted successfully");

      const deletedMovie = await AppDataSource.getRepository("Movie").findOne({
        where: { movieId: movie.movieId },
        withDeleted: true,
      });

      expect(deletedMovie.deletedAt).not.toBeNull();
    });

    it("does not delete movie with showtimes", async () => {
      const hall = await AppDataSource.getRepository("CinemaHall").save({
        name: "Main Hall",
        hallNumber: 1,
        capacity: 100,
      });

      const tariff = await AppDataSource.getRepository("Tariff").save({
        name: "Standard",
        startTime: "10:00:00",
        endTime: "22:00:00",
        priceMultiplier: 1,
      });

      const movie = await AppDataSource.getRepository("Movie").save({
        title: "Protected movie",
        ageLimit: 15,
        durationMin: 120,
        releaseYear: 2021,
        description: "Cannot delete",
      });

      await AppDataSource.getRepository("Showtime").save({
        movieId: movie.movieId,
        hallId: hall.hallId,
        showDate: "2025-12-20",
        showTime: "18:00:00",
        tariffId: tariff.tariffId,
      });

      const res = await request(app).delete(`/movies/${movie.movieId}`);

      expect(res.status).toBe(400);
    });
  });
});
