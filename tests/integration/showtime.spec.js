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

describe("Showtime API (integration)", () => {
  let movie;
  let hall;
  let tariff;

  beforeEach(async () => {
    movie = await AppDataSource.getRepository("Movie").save({
      title: "Test Movie",
      ageLimit: 12,
      durationMin: 120,
      releaseYear: 2025,
      description: "Test description",
    });

    hall = await AppDataSource.getRepository("CinemaHall").save({
      hallNumber: 1,
      capacity: 100,
    });

    tariff = await AppDataSource.getRepository("Tariff").save({
      name: "Standard",
      startTime: "10:00:00",
      endTime: "22:00:00",
      priceMultiplier: 1.0,
    });
  });

  describe("POST /showtimes", () => {
    it("creates a new showtime", async () => {
      const res = await request(app).post("/showtimes").send({
        movieId: movie.movieId,
        hallId: hall.hallId,
        showDate: "2025-12-20",
        showTime: "18:00:00",
      });

      expect(res.status).toBe(200);
      expect(res.body.showtimeId).toBeDefined();
      expect(res.body.movieId).toBe(movie.movieId);
      expect(res.body.hallId).toBe(hall.hallId);
      expect(res.body.tariffId).toBe(tariff.tariffId);
    });

    it("throws error if showtime in the past", async () => {
      const res = await request(app).post("/showtimes").send({
        movieId: movie.movieId,
        hallId: hall.hallId,
        showDate: "2000-01-01",
        showTime: "10:00:00",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("GET /showtimes", () => {
    it("returns list of showtimes grouped by movie", async () => {
      await request(app).post("/showtimes").send({
        movieId: movie.movieId,
        hallId: hall.hallId,
        showDate: "2025-12-20",
        showTime: "18:00:00",
      });

      const res = await request(app).get("/showtimes");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].movieId).toBe(movie.movieId);
      expect(res.body[0].showtimes).toHaveLength(1);
    });
  });

  describe("GET /showtimes/:id/seats", () => {
    it("returns hall seats with booking info", async () => {
      const showtimeRes = await request(app).post("/showtimes").send({
        movieId: movie.movieId,
        hallId: hall.hallId,
        showDate: "2025-12-20",
        showTime: "18:00:00",
      });

      const res = await request(app).get(
        `/showtimes/${showtimeRes.body.showtimeId}/seats`
      );

      expect(res.status).toBe(200);
      expect(res.body.seats).toBeDefined();
      expect(res.body.hallId).toBe(hall.hallId);
    });
  });

  describe("POST /showtimes/:id/bookings", () => {
    it("books seats successfully", async () => {
      const showtimeRes = await request(app).post("/showtimes").send({
        movieId: movie.movieId,
        hallId: hall.hallId,
        showDate: "2025-12-20",
        showTime: "18:00:00",
      });

      const seat = await AppDataSource.getRepository("Seat").save({
        hallId: hall.hallId,
        rowNumber: 1,
        seatNumber: 1,
        seatType: "standard",
        basePrice: 100,
      });

      const user = await AppDataSource.getRepository("User").save({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "hashedpassword",
      });

      const res = await request(app)
        .post(`/showtimes/${showtimeRes.body.showtimeId}/bookings`)
        .send({ userId: user.userId, seats: [seat.seatId] });

      expect(res.status).toBe(200);
      expect(res.body.bookingId).toBeDefined();
      expect(res.body.seats).toHaveLength(1);
    });
  });

  describe("PATCH /showtimes/:id", () => {
    it("updates showtime details", async () => {
      const showtimeRes = await request(app).post("/showtimes").send({
        movieId: movie.movieId,
        hallId: hall.hallId,
        showDate: "2025-12-20",
        showTime: "18:00:00",
      });

      const res = await request(app)
        .patch(`/showtimes/${showtimeRes.body.showtimeId}`)
        .send({ showTime: "20:00:00" });

      expect(res.status).toBe(200);
      expect(res.body.showTime).toBe("20:00:00");
    });
  });

  describe("DELETE /showtimes/:id", () => {
    it("deletes a showtime", async () => {
      const showtimeRes = await request(app).post("/showtimes").send({
        movieId: movie.movieId,
        hallId: hall.hallId,
        showDate: "2025-12-20",
        showTime: "18:00:00",
      });

      const res = await request(app).delete(
        `/showtimes/${showtimeRes.body.showtimeId}`
      );

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Showtime deleted successfully");
    });
  });
});
