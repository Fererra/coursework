import AppDataSource from "../data-source.js";
import { BookingStatus } from "../../booking/booking-status.js";
import { BookingSeatStatus } from "../../booking/booking-seat-status.js";

class ReportsRepository {
  #dataSource;

  constructor(dataSource) {
    this.#dataSource = dataSource;
  }

  getMoviesRevenueReport() {
    return this.#dataSource
      .getRepository("Movie")
      .createQueryBuilder("m")
      .leftJoin("m.showtimes", "s", "s.deletedAt IS NULL")
      .leftJoin("s.bookings", "b", "b.status != :cancelled", {
        cancelled: BookingStatus.CANCELLED,
      })
      .leftJoin("b.seats", "bs", "bs.status = :active", {
        active: BookingSeatStatus.ACTIVE,
      })
      .select([
        'm.movie_id AS "movieId"',
        'm.title AS "title"',
        'COALESCE(SUM(bs.final_price), 0) AS "totalRevenue"',
        'COALESCE(COUNT(bs.booking_seat_id), 0) AS "totalTickets"',
      ])
      .where("m.deletedAt IS NULL")
      .groupBy(["m.movie_id", "m.title"])
      .orderBy('"totalRevenue"', "DESC")
      .getRawMany();
  }
}

export const reportsRepository = new ReportsRepository(AppDataSource);