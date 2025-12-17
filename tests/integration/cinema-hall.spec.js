import request from "supertest";
import AppDataSource from "../../src/database/data-source.js";
import app from "../../src/app.js";
import { SeatType } from "../../src/modules/cinema-hall/seat-type.js";

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

describe("CinemaHall API (integration)", () => {
  describe("POST /cinema-halls", () => {
    it("creates a cinema hall with seats", async () => {
      const res = await request(app)
        .post("/cinema-halls")
        .send({
          hallNumber: 1,
          capacity: 100,
          seats: [
            {
              rowNumber: 1,
              seatNumber: 1,
              seatType: SeatType.STANDARD,
              basePrice: 100,
            },
            {
              rowNumber: 1,
              seatNumber: 2,
              seatType: SeatType.STANDARD,
              basePrice: 100,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.hallId).toBeDefined();
      expect(res.body.seats).toHaveLength(2);

      const hallInDb = await AppDataSource.getRepository("CinemaHall").findOne({
        where: { hallId: res.body.hallId },
        relations: ["seats"],
      });

      expect(hallInDb).not.toBeNull();
      expect(hallInDb.seats).toHaveLength(2);
    });

    it("returns 400 if hallNumber is missing", async () => {
      const res = await request(app).post("/cinema-halls").send({
        capacity: 50,
      });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /cinema-halls", () => {
    it("returns list of cinema halls", async () => {
      await AppDataSource.getRepository("CinemaHall").save({
        hallNumber: 1,
        capacity: 100,
      });

      const res = await request(app).get("/cinema-halls");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe("GET /cinema-halls/:id", () => {
    it("returns cinema hall details with seats", async () => {
      const hall = await AppDataSource.getRepository("CinemaHall").save({
        hallNumber: 1,
        capacity: 100,
      });

      await AppDataSource.getRepository("Seat").save([
        {
          hallId: hall.hallId,
          rowNumber: 1,
          seatNumber: 1,
          seatType: SeatType.STANDARD,
          basePrice: 100,
        },
        {
          hallId: hall.hallId,
          rowNumber: 1,
          seatNumber: 2,
          seatType: SeatType.STANDARD,
          basePrice: 100,
        },
      ]);

      const res = await request(app).get(`/cinema-halls/${hall.hallId}`);

      expect(res.status).toBe(200);
      expect(res.body.hallId).toBe(hall.hallId);
      expect(res.body.seats).toHaveLength(2);
    });

    it("returns 404 if hall not found", async () => {
      const res = await request(app).get("/cinema-halls/999");
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /cinema-halls/:id", () => {
    it("updates cinema hall and seats", async () => {
      const hall = await AppDataSource.getRepository("CinemaHall").save({
        hallNumber: 1,
        capacity: 100,
      });

      const seat = await AppDataSource.getRepository("Seat").save({
        hallId: hall.hallId,
        rowNumber: 1,
        seatNumber: 1,
        seatType: SeatType.STANDARD,
        basePrice: 100,
      });

      const res = await request(app)
        .patch(`/cinema-halls/${hall.hallId}`)
        .send({
          hallNumber: 2,
          seats: [
            {
              seatId: seat.seatId,
              rowNumber: 1,
              seatNumber: 1,
              seatType: SeatType.VIP,
              basePrice: 200,
            },
            {
              rowNumber: 1,
              seatNumber: 2,
              seatType: SeatType.STANDARD,
              basePrice: 100,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.hallNumber).toBe(hall.hallId);
      expect(res.body.seats).toHaveLength(2);
      const updatedSeat = res.body.seats.find((s) => s.seatId === seat.seatId);
      expect(updatedSeat.seatType).toBe(SeatType.VIP);
    });

    it("returns 404 if hall not found", async () => {
      const res = await request(app)
        .patch("/cinema-halls/999")
        .send({ hallNumber: 2 });
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /cinema-halls/:id", () => {
    it("soft deletes a cinema hall without showtimes", async () => {
      const hall = await AppDataSource.getRepository("CinemaHall").save({
        hallNumber: 1,
        capacity: 100,
      });

      const res = await request(app).delete(`/cinema-halls/${hall.hallId}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Cinema hall deleted successfully");

      const deletedHall = await AppDataSource.getRepository(
        "CinemaHall"
      ).findOne({
        where: { hallId: hall.hallId },
        withDeleted: true,
      });

      expect(deletedHall.deletedAt).not.toBeNull();
    });

    it("returns 400 if hall has showtimes", async () => {
      const hall = await AppDataSource.getRepository("CinemaHall").save({
        hallNumber: 1,
        capacity: 100,
      });

      const movie = await AppDataSource.getRepository("Movie").save({
        title: "Test Movie",
        ageLimit: 12,
        durationMin: 100,
        releaseYear: 2025,
        description: "Test movie description",
      });

      const tariff = await AppDataSource.getRepository("Tariff").save({
        name: "Standard",
        startTime: "10:00:00",
        endTime: "22:00:00",
        priceMultiplier: 1,
      });

      await AppDataSource.getRepository("Showtime").save({
        hallId: hall.hallId,
        movieId: movie.movieId,
        showDate: "2025-12-20",
        showTime: "10:00:00",
        tariffId: tariff.tariffId,
      });

      const res = await request(app).delete(`/cinema-halls/${hall.hallId}`);
      expect(res.status).toBe(400);
    });
  });
});
