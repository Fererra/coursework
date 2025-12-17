import request from "supertest";
import AppDataSource from "../../src/database/data-source.js";
import app from "../../src/app.js";
import { GenreErrorMessages } from "../../src/modules/genre/genre.errors.js";

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

describe("Genre API (integration)", () => {
  describe("GET /genres", () => {
    it("should return all genres", async () => {
      const genreRepo = AppDataSource.getRepository("Genre");
      await genreRepo.save([{ name: "Action" }, { name: "Comedy" }]);

      const res = await request(app).get("/genres");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBe("Action");
      expect(res.body[1].name).toBe("Comedy");
    });
  });

  describe("POST /genres", () => {
    it("should create a new genre", async () => {
      const res = await request(app).post("/genres").send({ name: "Horror" });

      expect(res.status).toBe(201);
      expect(res.body.genreId).toBeDefined();
      expect(res.body.name).toBe("Horror");
    });

    it("should return 400 for invalid data", async () => {
      const res = await request(app).post("/genres").send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it("should return 409 if genre already exists", async () => {
      await AppDataSource.getRepository("Genre").save({ name: "Horror" });

      const res = await request(app).post("/genres").send({ name: "Horror" });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe(GenreErrorMessages.GENRE_ALREADY_EXISTS);
    });
  });

  describe("PATCH /genres/:id", () => {
    it("should update a genre", async () => {
      const genre = await AppDataSource.getRepository("Genre").save({
        name: "Sci-Fi",
      });

      const res = await request(app)
        .patch(`/genres/${genre.genreId}`)
        .send({ name: "Science Fiction" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Science Fiction");
    });

    it("should return 404 if genre not found", async () => {
      const res = await request(app).patch("/genres/999").send({ name: "X" });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe(GenreErrorMessages.GENRE_NOT_FOUND);
    });
  });

  describe("DELETE /genres/:id", () => {
    it("should soft delete a genre", async () => {
      const genre = await AppDataSource.getRepository("Genre").save({
        name: "Drama",
      });

      const res = await request(app).delete(`/genres/${genre.genreId}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Genre deleted successfully");

      const deletedGenre = await AppDataSource.getRepository("Genre").findOne({
        where: { genreId: genre.genreId },
        withDeleted: true,
      });

      expect(deletedGenre.deletedAt).not.toBeNull();
    });

    it("should return 404 if genre not found", async () => {
      const res = await request(app).delete("/genres/999");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe(GenreErrorMessages.GENRE_NOT_FOUND);
    });
  });
});
