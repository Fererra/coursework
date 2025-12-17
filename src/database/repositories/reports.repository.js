import AppDataSource from "../data-source.js";
import { BookingStatus } from "../../modules/booking/booking-status.js";
import { BookingSeatStatus } from "../../modules/booking/booking-seat-status.js";

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

  getMoviesAttendanceReport() {
    const sql = `
      WITH showtime_stats AS (
        SELECT
          s.showtime_id,
          s.movie_id,
          h.capacity,
          COUNT(bs.booking_seat_id) AS tickets_sold
        FROM showtime s
        JOIN cinema_hall h ON s.hall_id = h.hall_id
        LEFT JOIN booking b ON b.showtime_id = s.showtime_id AND b.status != $1
        LEFT JOIN booking_seat bs ON bs.booking_id = b.booking_id AND bs.status = $2
        WHERE s.deleted_at IS NULL
        GROUP BY s.showtime_id, s.movie_id, h.capacity
      )
      SELECT
        m.movie_id AS "movieId",
        m.title AS "title",
        COUNT(ss.showtime_id) AS "totalShowtimes",
        SUM(ss.tickets_sold) AS "totalTicketsSold",
        ROUND(AVG(ss.capacity)) AS "avgCapacityPerShowtime",
        ROUND((SUM(ss.tickets_sold) / SUM(ss.capacity)), 2) AS "avgOccupancy"
      FROM movie m
      LEFT JOIN showtime_stats ss ON ss.movie_id = m.movie_id
      WHERE m.deleted_at IS NULL
      GROUP BY m.movie_id, m.title
      ORDER BY "totalTicketsSold" DESC
    `;

    return this.#dataSource.query(sql, [
      BookingStatus.CANCELLED,
      BookingSeatStatus.ACTIVE,
    ]);
  }

  getUsersSpendingReport() {
    return this.#dataSource
      .getRepository("User")
      .createQueryBuilder("u")
      .leftJoin("u.bookings", "b", "b.status != :cancelled", {
        cancelled: BookingStatus.CANCELLED,
      })
      .leftJoin("b.seats", "bs", "bs.status = :active", {
        active: BookingSeatStatus.ACTIVE,
      })
      .select([
        `u.user_id AS "userId"`,
        `u.first_name || ' ' || u.last_name AS "fullName"`,
        `COALESCE(SUM(bs.final_price), 0) AS "totalSpent"`,
        `COUNT(bs.booking_seat_id) AS "totalTickets"`,
        `ROUND(COALESCE(AVG(bs.final_price), 0), 2) AS "avgTicketPrice"`,
        `RANK() OVER (ORDER BY SUM(bs.final_price) DESC) AS "spendingRank"`,
      ])
      .groupBy(["u.user_id", "u.first_name", "u.last_name"])
      .orderBy(`"totalSpent"`, "DESC")
      .getRawMany();
  }
}

export const reportsRepository = new ReportsRepository(AppDataSource);
