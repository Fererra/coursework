import AppDataSource from "../data-source.js";
import { BookingErrorMessages } from "../../modules/booking/booking.errors.js";
import { BookingStatus } from "../../modules/booking/booking-status.js";
import { BookingSeatStatus } from "../../modules/booking/booking-seat-status.js";
import { In } from "typeorm";

export class BookingRepository {
  #repo;
  #dataSource;

  constructor(dataSource) {
    this.#repo = dataSource.getRepository("Booking");
    this.#dataSource = dataSource;
  }

  getBookingsByUserId(userId) {
    return this.#repo
      .createQueryBuilder("booking")
      .withDeleted()
      .leftJoinAndSelect("booking.showtime", "showtime")
      .leftJoinAndSelect("showtime.movie", "movie")
      .leftJoinAndSelect("booking.seats", "bookingSeat")
      .leftJoinAndSelect("bookingSeat.seat", "seat")
      .where("booking.user = :userId", { userId })
      .select([
        "booking.bookingId",
        "booking.totalPrice",
        "booking.status",
        "booking.bookingDate",
        "showtime.showtimeId",
        "showtime.showDate",
        "showtime.showTime",
        "movie.movieId",
        "movie.title",
        "bookingSeat.finalPrice",
        "seat.seatId",
        "seat.rowNumber",
        "seat.seatNumber",
      ])
      .getMany();
  }

  getBookingsByShowtime(showtimeId) {
    return this.#repo
      .createQueryBuilder("booking")
      .withDeleted()
      .leftJoinAndSelect("booking.seats", "bookingSeat")
      .leftJoinAndSelect("bookingSeat.seat", "seat")
      .where("booking.showtime = :showtimeId", { showtimeId })
      .select([
        "booking.bookingId",
        "booking.totalPrice",
        "booking.status",
        "booking.bookingDate",
        "bookingSeat.finalPrice",
        "seat.seatId",
        "seat.rowNumber",
        "seat.seatNumber",
      ])
      .getMany();
  }

  async bookSeats(showtimeId, seatIds, userId) {
    return this.#dataSource.transaction(async (manager) => {
      const showtime = await manager
        .getRepository("Showtime")
        .createQueryBuilder("showtime")
        .select(["showtime.showtimeId"])
        .where("showtime.showtime_id = :showtimeId", { showtimeId })
        .andWhere("showtime.deleted_at IS NULL")
        .getOne();

      if (!showtime) {
        throw new Error(ShowtimeErrorMessages.SHOWTIME_NOT_FOUND);
      }

      const existingSeats = await manager
        .getRepository("BookingSeat")
        .createQueryBuilder("bs")
        .select(["bs.seatId"])
        .where("bs.showtime_id = :showtimeId", { showtimeId })
        .andWhere("bs.seat_id IN (:...seatIds)", { seatIds })
        .andWhere("bs.status = :status", { status: BookingSeatStatus.ACTIVE })
        .getMany();

      if (existingSeats.length > 0) {
        const takenIds = existingSeats.map((s) => s.seatId);
        throw new Error(`Seats already booked: ${takenIds.join(", ")}`);
      }

      const seats = await manager
        .getRepository("Seat")
        .createQueryBuilder("seat")
        .select(["seat.seatId", "seat.basePrice"])
        .where("seat.seat_id IN (:...seatIds)", { seatIds })
        .andWhere("seat.deleted_at IS NULL")
        .getMany();

      if (seats.length !== seatIds.length) {
        throw new Error(BookingErrorMessages.SOME_SEATS_NOT_FOUND);
      }

      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      const currentTime = `${hh}:${mm}:${ss}`;

      const tariff = await manager
        .getRepository("Tariff")
        .createQueryBuilder("tariff")
        .select(["tariff.tariffId", "tariff.priceMultiplier"])
        .where("tariff.deleted_at IS NULL")
        .andWhere(
          ":currentTime BETWEEN tariff.start_time AND tariff.end_time",
          { currentTime }
        )
        .getOne();

      if (!tariff) {
        throw new Error(BookingErrorMessages.NO_ACTIVE_TARIFF);
      }

      let totalPrice = 0;
      const bookingSeatsData = seats.map((seat) => {
        const finalPrice =
          parseFloat(seat.basePrice) * parseFloat(tariff.priceMultiplier || 1);
        totalPrice += finalPrice;

        return {
          showtimeId,
          seatId: seat.seatId,
          tariffId: tariff.tariffId,
          finalPrice,
        };
      });

      const booking = manager.create("Booking", {
        user: { userId },
        showtime: { showtimeId },
        totalPrice,
      });

      await manager.save("Booking", booking);

      const bookingSeats = bookingSeatsData.map((bs) =>
        manager.create("BookingSeat", {
          ...bs,
          bookingId: booking.bookingId,
        })
      );

      await manager.save("BookingSeat", bookingSeats);

      return {
        bookingId: booking.bookingId,
        totalPrice,
        status: booking.status,
        seats: bookingSeats.map((s) => ({
          seatId: s.seatId,
          finalPrice: s.finalPrice,
        })),
      };
    });
  }

  async getBookingById(bookingId) {
    return this.#repo
      .createQueryBuilder("booking")
      .leftJoinAndSelect("booking.showtime", "showtime")
      .leftJoinAndSelect("showtime.movie", "movie")
      .leftJoinAndSelect("booking.seats", "bookingSeat")
      .leftJoinAndSelect("bookingSeat.seat", "seat")
      .where("booking.bookingId = :bookingId", { bookingId })
      .andWhere("booking.status != :deletedStatus", {
        deletedStatus: BookingStatus.CANCELLED,
      })
      .andWhere("showtime.deletedAt IS NULL")
      .andWhere("movie.deletedAt IS NULL")
      .andWhere("bookingSeat.deletedAt IS NULL")
      .andWhere("seat.deletedAt IS NULL")
      .select([
        "booking.bookingId",
        "booking.totalPrice",
        "booking.status",
        "booking.bookingDate",
        "showtime.showtimeId",
        "showtime.showDate",
        "showtime.showTime",
        "movie.movieId",
        "movie.title",
        "bookingSeat.finalPrice",
        "seat.seatId",
        "seat.rowNumber",
        "seat.seatNumber",
      ])
      .getOne();
  }

  async cancelBooking(bookingId) {
    return this.#dataSource.transaction(async (manager) => {
      const booking = await manager.findOne("Booking", {
        where: {
          bookingId,
          status: In([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
        },
        lock: { mode: "pessimistic_write" },
      });

      if (!booking) throw new Error(BookingErrorMessages.BOOKING_NOT_FOUND);

      await manager.update(
        "Booking",
        { bookingId },
        { status: BookingStatus.CANCELLED }
      );

      await manager.update(
        "BookingSeat",
        { bookingId, status: BookingSeatStatus.ACTIVE },
        { status: BookingSeatStatus.CANCELLED }
      );

      return { message: "Booking cancelled successfully" };
    });
  }
}

export const bookingRepository = new BookingRepository(AppDataSource);
