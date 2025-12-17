import request from "supertest";
import AppDataSource from "../../src/database/data-source.js";
import app from "../../src/app.js";
import { BookingStatus } from "../../src/modules/booking/booking-status.js";
import { BookingSeatStatus } from "../../src/modules/booking/booking-seat-status.js";

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
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
});

describe("Reports API (integration)", () => {
  describe("GET /reports/movies/revenue", () => {
    it("returns movies revenue report", async () => {
      const movie = await AppDataSource.getRepository("Movie").save({
        title: "Inception",
        ageLimit: 16,
        durationMin: 148,
        releaseYear: 2010,
        description: "Mind-bending thriller",
      });

      const hall = await AppDataSource.getRepository("CinemaHall").save({
        hallNumber: 1,
        capacity: 100,
      });

      const seat = await AppDataSource.getRepository("Seat").save({
        hallId: hall.hallId,
        rowNumber: 1,
        seatNumber: 1,
        seatType: "standard",
        basePrice: 200,
      });

      const tariff = await AppDataSource.getRepository("Tariff").save({
        name: "Standard",
        startTime: "10:00:00",
        endTime: "22:00:00",
        priceMultiplier: 1.0,
      });

      const showtime = await AppDataSource.getRepository("Showtime").save({
        movieId: movie.movieId,
        hallId: hall.hallId,
        showDate: "2025-12-20",
        showTime: "18:00:00",
        tariffId: tariff.tariffId,
      });

      const user = await AppDataSource.getRepository("User").save({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "hashedpassword",
      });

      const booking = await AppDataSource.getRepository("Booking").save({
        userId: user.userId,
        showtimeId: showtime.showtimeId,
        status: BookingStatus.CONFIRMED,
        totalPrice: 200,
      });

      await AppDataSource.getRepository("BookingSeat").save({
        bookingId: booking.bookingId,
        showtimeId: showtime.showtimeId,
        seatId: seat.seatId,
        tariffId: tariff.tariffId,
        status: BookingSeatStatus.ACTIVE,
        finalPrice: 200,
      });

      const res = await request(app).get("/reports/movies/revenue");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        movieId: movie.movieId,
        title: movie.title,
        totalRevenue: "200.00",
        totalTickets: "1",
      });
    });
  });

  describe("GET /reports/movies/attendance", () => {
    it("returns movies attendance report", async () => {
      const movie = await AppDataSource.getRepository("Movie").save({
        title: "Avatar",
        ageLimit: 12,
        durationMin: 160,
        releaseYear: 2009,
      });

      const hall = await AppDataSource.getRepository("CinemaHall").save({
        hallNumber: 2,
        capacity: 100,
      });

      const seat = await AppDataSource.getRepository("Seat").save({
        hallId: hall.hallId,
        rowNumber: 1,
        seatNumber: 1,
        seatType: "standard",
        basePrice: 200,
      });

      const tariff = await AppDataSource.getRepository("Tariff").save({
        name: "Standard",
        startTime: "10:00:00",
        endTime: "22:00:00",
        priceMultiplier: 1.0,
      });

      const showtime = await AppDataSource.getRepository("Showtime").save({
        movieId: movie.movieId,
        hallId: hall.hallId,
        showDate: "2025-12-20",
        showTime: "18:00:00",
        tariffId: tariff.tariffId,
      });

      const user = await AppDataSource.getRepository("User").save({
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
        password: "hashedpassword",
      });

      const booking = await AppDataSource.getRepository("Booking").save({
        userId: user.userId,
        showtimeId: showtime.showtimeId,
        status: BookingStatus.CONFIRMED,
        totalPrice: 100,
      });

      await AppDataSource.getRepository("BookingSeat").save({
        bookingId: booking.bookingId,
        showtimeId: showtime.showtimeId,
        seatId: seat.seatId,
        tariffId: tariff.tariffId,
        status: BookingSeatStatus.ACTIVE,
        finalPrice: 100,
      });

      const res = await request(app).get("/reports/movies/attendance");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty("movieId", movie.movieId);
      expect(res.body[0]).toHaveProperty("title", movie.title);
      expect(res.body[0]).toHaveProperty("totalShowtimes", "1");
      expect(res.body[0]).toHaveProperty("totalTicketsSold", "1");
    });
  });

  describe("GET /reports/users/spending", () => {
    it("returns users spending report", async () => {
      const user = await AppDataSource.getRepository("User").save({
        firstName: "Bob",
        lastName: "Builder",
        email: "bob@example.com",
        password: "hashedpassword",
      });

      const movie = await AppDataSource.getRepository("Movie").save({
        title: "Titanic",
        ageLimit: 12,
        durationMin: 195,
        releaseYear: 1997,
      });

      const hall = await AppDataSource.getRepository("CinemaHall").save({
        hallNumber: 3,
        capacity: 100,
      });

      const seat = await AppDataSource.getRepository("Seat").save({
        hallId: hall.hallId,
        rowNumber: 1,
        seatNumber: 1,
        seatType: "standard",
        basePrice: 200,
      });

      const tariff = await AppDataSource.getRepository("Tariff").save({
        name: "Standard",
        startTime: "10:00:00",
        endTime: "22:00:00",
        priceMultiplier: 1.0,
      });

      const showtime = await AppDataSource.getRepository("Showtime").save({
        movieId: movie.movieId,
        hallId: hall.hallId,
        showDate: "2025-12-20",
        showTime: "18:00:00",
        tariffId: tariff.tariffId,
      });

      const booking = await AppDataSource.getRepository("Booking").save({
        userId: user.userId,
        showtimeId: showtime.showtimeId,
        status: BookingStatus.CONFIRMED,
        totalPrice: 150,
      });

      await AppDataSource.getRepository("BookingSeat").save({
        bookingId: booking.bookingId,
        showtimeId: showtime.showtimeId,
        seatId: seat.seatId,
        tariffId: tariff.tariffId,
        status: BookingSeatStatus.ACTIVE,
        finalPrice: 150,
      });

      const res = await request(app).get("/reports/users/spending");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        userId: user.userId,
        fullName: "Bob Builder",
        totalSpent: "150.00",
        totalTickets: "1",
      });
    });
  });
});
