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

describe("Auth API (integration)", () => {
  describe("POST /auth/signUp", () => {
    it("should register a user successfully", async () => {
      const res = await request(app).post("/auth/signUp").send({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.userId).toBeDefined();
      expect(res.body.message).toBe("User registered successfully");
    });

    it("should return 400 on invalid data", async () => {
      const res = await request(app).post("/auth/signUp").send({
        firstName: "John",
        email: "invalid-email",
        password: "123",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it("should return 409 if user already exists", async () => {
      await AppDataSource.getRepository("User").save({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "hashedpassword",
      });

      const res = await request(app).post("/auth/signUp").send({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      expect(res.status).toBe(409);
    });
  });

  describe("POST /auth/login", () => {
    it("should login successfully with correct credentials", async () => {
      const { hash } = await import("argon2");
      const hashedPassword = await hash("password123");
      const user = await AppDataSource.getRepository("User").save({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: hashedPassword,
      });

      const res = await request(app).post("/auth/login").send({
        email: "john@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.userId).toBe(user.userId);
      expect(res.body.message).toBe("Login successful");
    });

    it("should return 401 for invalid password", async () => {
      const { hash } = await import("argon2");
      const hashedPassword = await hash("password123");
      await AppDataSource.getRepository("User").save({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: hashedPassword,
      });

      const res = await request(app).post("/auth/login").send({
        email: "john@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
    });

    it("should return 404 if user not found", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(res.status).toBe(404);
    });

    it("should return 400 if validation fails", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "invalid-email",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });
});
