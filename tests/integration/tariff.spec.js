import request from "supertest";
import AppDataSource from "../../src/database/data-source.js";
import app from "../../src/app.js";
import { BookingSeatStatus } from "../../src/modules/booking/booking-seat-status.js";
import { BookingStatus } from "../../src/modules/booking/booking-status.js";
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

describe("Tariff API (integration)", () => {
  describe("POST /tariffs", () => {
    it("creates a tariff", async () => {
      const res = await request(app).post("/tariffs").send({
        name: "Morning",
        startTime: "08:00:00",
        endTime: "12:00:00",
        priceMultiplier: 1.2,
      });

      expect(res.status).toBe(201);
      expect(res.body.tariffId).toBeDefined();
      expect(res.body.name).toBe("Morning");
    });

    it("returns 400 if invalid data", async () => {
      const res = await request(app).post("/tariffs").send({
        name: "Invalid",
        startTime: "08:00",
        endTime: "12:00",
        priceMultiplier: -1,
      });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /tariffs", () => {
    it("returns list of tariffs", async () => {
      await AppDataSource.getRepository("Tariff").save([
        {
          name: "Morning",
          startTime: "08:00:00",
          endTime: "12:00:00",
          priceMultiplier: 1.2,
        },
        {
          name: "Evening",
          startTime: "18:00:00",
          endTime: "22:00:00",
          priceMultiplier: 1.5,
        },
      ]);

      const res = await request(app).get("/tariffs");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBe("Morning");
      expect(res.body[1].name).toBe("Evening");
    });
  });

  describe("PATCH /tariffs/:id", () => {
    it("updates tariff data", async () => {
      const tariff = await AppDataSource.getRepository("Tariff").save({
        name: "Morning",
        startTime: "08:00:00",
        endTime: "12:00:00",
        priceMultiplier: 1.2,
      });

      const res = await request(app).patch(`/tariffs/${tariff.tariffId}`).send({
        name: "Early Morning",
        priceMultiplier: 1.3,
      });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Early Morning");
      expect(res.body.priceMultiplier).toBe(1.3);
    });

    it("returns 404 if tariff not found", async () => {
      const res = await request(app).patch("/tariffs/999").send({
        name: "Does not matter",
      });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /tariffs/:id", () => {
    it("soft deletes a tariff without bookings", async () => {
      const tariff = await AppDataSource.getRepository("Tariff").save({
        name: "Morning",
        startTime: "08:00:00",
        endTime: "12:00:00",
        priceMultiplier: 1.2,
      });

      const res = await request(app).delete(`/tariffs/${tariff.tariffId}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Tariff deleted successfully");

      const deletedTariff = await AppDataSource.getRepository("Tariff").findOne(
        {
          where: { tariffId: tariff.tariffId },
          withDeleted: true,
        }
      );

      expect(deletedTariff.deletedAt).not.toBeNull();
    });

    it("does not delete tariff with active bookings", async () => {
      const user = await AppDataSource.getRepository("User").save({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "secret",
      });

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

      const movie = await AppDataSource.getRepository("Movie").save({
        title: "Test Movie",
        ageLimit: 12,
        durationMin: 120,
        releaseYear: 2025,
      });

      const tariff = await AppDataSource.getRepository("Tariff").save({
        name: "Morning",
        startTime: "08:00:00",
        endTime: "12:00:00",
        priceMultiplier: 1.2,
      });

      const showtime = await AppDataSource.getRepository("Showtime").save({
        hallId: hall.hallId,
        movieId: movie.movieId,
        showDate: "2025-12-20",
        showTime: "10:00:00",
        tariffId: tariff.tariffId,
      });

      const booking = await AppDataSource.getRepository("Booking").save({
        userId: user.userId,
        showtimeId: showtime.showtimeId,
        totalPrice: 100,
        status: BookingStatus.CONFIRMED,
      });

      await AppDataSource.getRepository("BookingSeat").save({
        bookingId: booking.bookingId,
        tariffId: tariff.tariffId,
        seatId: seat.seatId,
        showtimeId: showtime.showtimeId,
        finalPrice: 100,
        status: BookingSeatStatus.ACTIVE,
      });

      const res = await request(app).delete(`/tariffs/${tariff.tariffId}`);

      expect(res.status).toBe(400);
    });
  });
});
