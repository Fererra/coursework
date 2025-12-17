import request from "supertest";
import AppDataSource from "../../src/database/data-source.js";
import app from "../../src/app.js";
import { BookingStatus } from "../../src/modules/booking/booking-status.js";
import { BookingSeatStatus } from "../../src/modules/booking/booking-seat-status.js";
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

describe("Users API (integration)", () => {
  describe("GET /users/:id", () => {
    it("should return user data", async () => {
      const user = await AppDataSource.getRepository("User").save({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "hashedpassword",
      });

      const res = await request(app).get(`/users/${user.userId}`);

      expect(res.status).toBe(200);
      expect(res.body.userId).toBe(user.userId);
      expect(res.body.firstName).toBe("John");
    });

    it("should return 404 if user not found", async () => {
      const res = await request(app).get("/users/999");
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /users/:id", () => {
    it("should update user data", async () => {
      const user = await AppDataSource.getRepository("User").save({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "hashedpassword",
      });

      const res = await request(app)
        .patch(`/users/${user.userId}`)
        .send({ firstName: "Jane" });

      expect(res.status).toBe(200);
      expect(res.body.firstName).toBe("Jane");
    });

    it("should return 404 if user not found", async () => {
      const res = await request(app)
        .patch("/users/999")
        .send({ firstName: "Jane" });
      expect(res.status).toBe(404);
    });

    it("should return 400 if validation fails", async () => {
      const user = await AppDataSource.getRepository("User").save({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "hashedpassword",
      });

      const res = await request(app)
        .patch(`/users/${user.userId}`)
        .send({ password: "newpassword" });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete user without bookings", async () => {
      const user = await AppDataSource.getRepository("User").save({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "hashedpassword",
      });

      const res = await request(app).delete(`/users/${user.userId}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User deleted successfully");
    });

    it("should not delete user with bookings", async () => {
      const user = await AppDataSource.getRepository("User").save({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "hashedpassword",
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

      const res = await request(app).delete(`/users/${user.userId}`);
      expect(res.status).toBe(403);
    });
  });

  describe("GET /users/:id/bookings", () => {
    it("should return paginated bookings for user", async () => {
      const user = await AppDataSource.getRepository("User").save({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "hashedpassword",
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

      const res = await request(app).get(
        `/users/${user.userId}/bookings?page=1&pageSize=10`
      );
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });
});
