import { ShowtimeErrorMessages } from "../../showtime/showtime.errors.js";
import { BookingSeatStatus } from "../../booking/booking-seat.status.js";
import AppDataSource from "../data-source.js";

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
      throw new Error("Showtime not found");
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

  createShowtime(data) {
    return this.#dataSource.transaction(async (manager) => {
      try {
        const showtime = manager.create("Showtime", data);
        await manager.save("Showtime", showtime);
        return showtime;
      } catch (error) {
        if (error.code === "23505") {
          throw new Error(ShowtimeErrorMessages.SHOWTIME_ALREADY_EXISTS);
        }
        throw error;
      }
    });
  }

  updateShowtime(showtimeId, updateData) {
    return this.#dataSource.transaction(async (manager) => {
      const showtime = await manager.findOne("Showtime", {
        select: ["showtimeId", "hallId", "movieId", "showDate", "showTime"],
        where: { showtimeId, deletedAt: null },
      });

      if (!showtime) {
        throw new Error(ShowtimeErrorMessages.SHOWTIME_NOT_FOUND);
      }

      Object.assign(showtime, updateData);

      try {
        await manager.save("Showtime", showtime);
        return showtime;
      } catch (error) {
        if (error.code === "23505") {
          throw new Error(ShowtimeErrorMessages.SHOWTIME_ALREADY_EXISTS);
        }
        throw error;
      }
    });
  }

  async deleteShowtime(showtimeId) {
    return this.#dataSource.transaction(async (manager) => {
      const showtime = await manager
        .getRepository("Showtime")
        .createQueryBuilder("showtime")
        .leftJoinAndSelect(
          "showtime.bookings",
          "booking",
          "booking.status != :deletedStatus",
          {
            deletedStatus: BookingSeatStatus.CANCELLED,
          }
        )
        .where("showtime.showtime_id = :showtimeId", { showtimeId })
        .andWhere("showtime.deleted_at IS NULL")
        .getOne();

      if (!showtime) {
        throw new Error(ShowtimeErrorMessages.SHOWTIME_NOT_FOUND);
      }

      if (showtime.bookings && showtime.bookings.length > 0) {
        throw new Error(ShowtimeErrorMessages.SHOWTIME_DELETE_ERROR);
      }

      await manager.softDelete("Showtime", { showtimeId });

      return { message: "Showtime deleted successfully" };
    });
  }
}

export const showtimeRepository = new ShowtimeRepository(AppDataSource);
