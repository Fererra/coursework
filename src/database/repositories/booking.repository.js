import AppDataSource from "../data-source.js";

export class BookingRepository {
  #repo;

  constructor(dataSource) {
    this.#repo = dataSource.getRepository("Booking");
  }

  getBookingsByUserId(userId) {
    return this.#repo
      .createQueryBuilder("booking")
      .leftJoinAndSelect("booking.showtime", "showtime")
      .leftJoinAndSelect("showtime.movie", "movie")
      .leftJoinAndSelect("booking.seats", "bookingSeat")
      .leftJoinAndSelect("bookingSeat.seat", "seat")
      .where("booking.user = :userId", { userId })
      .andWhere("booking.deletedAt IS NULL")
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
        "bookingSeat.tariffId",
        "seat.seatId",
        "seat.rowNumber",
        "seat.seatNumber",
      ])

      .getMany();
  }
}

export const bookingRepository = new BookingRepository(AppDataSource);