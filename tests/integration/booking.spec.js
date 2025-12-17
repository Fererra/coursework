import request from "supertest";
import AppDataSource from "../../src/database/data-source.js";
import app from "../../src/app.js";
import { BookingStatus } from "../../src/modules/booking/booking-status.js";
import { BookingSeatStatus } from "../../src/modules/booking/booking-seat-status.js";
import { BookingErrorMessages } from "../../src/modules/booking/booking.errors.js";
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

describe("Booking API (integration)", () => {
  describe("GET /bookings/:id", () => {
    it("should return booking details", async () => {
      const user = await AppDataSource.getRepository("User").save({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "hashedpassword",
      });

      const hall = await AppDataSource.getRepository("CinemaHall").save({
        hallNumber: 1,
        capacity: 50,
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
        totalPrice: 120,
        status: BookingStatus.CONFIRMED,
      });

      await AppDataSource.getRepository("BookingSeat").save({
        bookingId: booking.bookingId,
        tariffId: tariff.tariffId,
        seatId: seat.seatId,
        showtimeId: showtime.showtimeId,
        finalPrice: 120,
        status: BookingSeatStatus.ACTIVE,
      });

      const res = await request(app).get(`/bookings/${booking.bookingId}`);

      expect(res.status).toBe(200);
      expect(res.body.bookingId).toBe(booking.bookingId);
      expect(res.body.seats).toHaveLength(1);
    });

    it("should return 404 if booking not found", async () => {
      const res = await request(app).get("/bookings/999");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe(BookingErrorMessages.BOOKING_NOT_FOUND);
    });
  });

  describe("DELETE /bookings/:id", () => {
    it("should cancel booking", async () => {
      const user = await AppDataSource.getRepository("User").save({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "hashedpassword",
      });

      const hall = await AppDataSource.getRepository("CinemaHall").save({
        hallNumber: 1,
        capacity: 50,
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
        totalPrice: 120,
        status: BookingStatus.CONFIRMED,
      });

      await AppDataSource.getRepository("BookingSeat").save({
        bookingId: booking.bookingId,
        tariffId: tariff.tariffId,
        seatId: seat.seatId,
        showtimeId: showtime.showtimeId,
        finalPrice: 120,
        status: BookingSeatStatus.ACTIVE,
      });

      const res = await request(app).delete(`/bookings/${booking.bookingId}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Booking cancelled successfully");

      const cancelledBooking = await AppDataSource.getRepository(
        "Booking"
      ).findOne({
        where: { bookingId: booking.bookingId },
      });

      expect(cancelledBooking.status).toBe(BookingStatus.CANCELLED);
    });

    it("should return 404 if booking not found", async () => {
      const res = await request(app).delete("/bookings/999");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe(BookingErrorMessages.BOOKING_NOT_FOUND);
    });
  });
});
