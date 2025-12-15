import { ShowtimeErrorMessages } from "../../modules/showtime/showtime.errors.js";
import { BookingSeatStatus } from "../../modules/booking/booking-seat.status.js";
import AppDataSource from "../data-source.js";
import { handleDatabaseError } from "../../common/utils/db-errors.js";

class ShowtimeRepository {
  #repo;
  #dataSource;

  constructor(dataSource) {
    this.#repo = dataSource.getRepository("Showtime");
    this.#dataSource = dataSource;
  }

  getAllShowtimes() {
    return this.#repo
      .createQueryBuilder("showtime")
      .leftJoinAndSelect("showtime.movie", "movie")
      .select([
        "showtime.showtimeId",
        "showtime.showDate",
        "showtime.showTime",
        "movie.movieId",
        "movie.title",
      ])
      .getMany();
  }

  async getHallPlan(showtimeId) {
    const showtime = await this.#dataSource.getRepository("Showtime").findOne({
      select: ["showtimeId", "hallId"],
      where: { showtimeId, deletedAt: null },
    });

    if (!showtime) {
      throw new Error(ShowtimeErrorMessages.SHOWTIME_NOT_FOUND);
    }

    const hallSeats = await this.#dataSource.getRepository("Seat").find({
      select: ["seatId", "rowNumber", "seatNumber", "seatType", "basePrice"],
      where: { hallId: showtime.hallId, deletedAt: null },
    });

    const bookedSeats = await this.#dataSource
      .getRepository("BookingSeat")
      .find({
        select: ["seatId"],
        where: { showtimeId, status: BookingSeatStatus.ACTIVE },
      });

    const seats = hallSeats.map((seat) => ({
      seatId: seat.seatId,
      row: seat.rowNumber,
      number: seat.seatNumber,
      seatType: seat.seatType,
      basePrice: seat.basePrice,
      isBooked: bookedSeats.some((bs) => bs.seatId === seat.seatId),
    }));

    return {
      showtimeId: showtime.showtimeId,
      hallId: showtime.hallId,
      seats,
    };
  }

  getShowtimeDetails(showtimeId) {
    return this.#repo.findOne({
      select: ["showtimeId", "hallId", "movieId", "showDate", "showTime"],
      where: { showtimeId, deletedAt: null },
    });
  }

  async createShowtime(data) {
    try {
      return await this.#repo.save(data);
    } catch (error) {
      handleDatabaseError(error, ShowtimeErrorMessages.SHOWTIME_ALREADY_EXISTS);
    }
  }

  async updateShowtime(showtimeId, updateData) {
    try {
      return await this.#dataSource.transaction(async (manager) => {
        const showtime = await manager.findOne("Showtime", {
          select: ["showtimeId", "hallId", "movieId", "showDate", "showTime"],
          where: { showtimeId, deletedAt: null },
          lock: { mode: "pessimistic_write" },
        });

        if (!showtime) {
          throw new Error(ShowtimeErrorMessages.SHOWTIME_NOT_FOUND);
        }

        Object.assign(showtime, updateData);

        return await manager.save("Showtime", showtime);
      });
    } catch (error) {
      handleDatabaseError(error, ShowtimeErrorMessages.SHOWTIME_ALREADY_EXISTS);
    }
  }

  async deleteShowtime(showtimeId) {
    return this.#dataSource.transaction(async (manager) => {
      const showtime = await manager.findOne("Showtime", {
        where: { showtimeId, deletedAt: null },
        lock: { mode: "pessimistic_write" },
      });

      if (!showtime) {
        throw new Error(ShowtimeErrorMessages.SHOWTIME_NOT_FOUND);
      }

      const bookingCount = await manager.count("BookingSeat", {
        where: { showtimeId, status: BookingSeatStatus.ACTIVE },
      });

      if (bookingCount > 0) {
        throw new Error(ShowtimeErrorMessages.SHOWTIME_DELETE_ERROR);
      }

      await manager.softDelete("Showtime", { showtimeId });

      return { message: "Showtime deleted successfully" };
    });
  }
}

export const showtimeRepository = new ShowtimeRepository(AppDataSource);
