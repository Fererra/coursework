import { ShowtimeErrorMessages } from "../../modules/showtime/showtime.errors.js";
import { BookingSeatStatus } from "../../modules/booking/booking-seat-status.js";
import AppDataSource from "../data-source.js";
import { handleDatabaseError } from "../../common/utils/db-errors.js";
import { LessThanOrEqual, MoreThan } from "typeorm";

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
      .leftJoinAndSelect("showtime.movie", "movie", "movie.deletedAt IS NULL")
      .where("showtime.deletedAt IS NULL")
      .andWhere("showtime.showDate >= CURRENT_DATE")
      .andWhere("showtime.showDate < CURRENT_DATE + INTERVAL '7 days'")
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
      where: { showtimeId, deletedAt: null },
      relations: ["tariff"],
    });

    if (!showtime) {
      throw new Error("Showtime not found");
    }

    const hallSeats = await this.#dataSource.getRepository("Seat").find({
      where: { hallId: showtime.hallId, deletedAt: null },
    });

    const bookedSeats = await this.#dataSource
      .getRepository("BookingSeat")
      .find({
        select: ["seatId"],
        where: {
          showtimeId,
          status: BookingSeatStatus.ACTIVE,
        },
      });

    const bookedSeatIds = new Set(bookedSeats.map((bs) => bs.seatId));

    const seats = hallSeats.map((seat) => ({
      seatId: seat.seatId,
      row: seat.rowNumber,
      number: seat.seatNumber,
      seatType: seat.seatType,
      finalPrice: Number(
        (seat.basePrice * showtime.tariff.priceMultiplier).toFixed(2)
      ),
      isBooked: bookedSeatIds.has(seat.seatId),
    }));

    return {
      showtimeId: showtime.showtimeId,
      hallId: showtime.hallId,
      seats,
    };
  }

  getShowtimeDetails(showtimeId) {
    return this.#repo
      .createQueryBuilder("showtime")
      .leftJoinAndSelect("showtime.movie", "movie", "movie.deletedAt IS NULL")
      .leftJoinAndSelect("showtime.hall", "hall", "hall.deletedAt IS NULL")
      .leftJoinAndSelect(
        "showtime.tariff",
        "tariff",
        "tariff.deletedAt IS NULL"
      )
      .where("showtime.showtimeId = :showtimeId", { showtimeId })
      .andWhere("showtime.deletedAt IS NULL")
      .select([
        "showtime.showtimeId",
        "showtime.showDate",
        "showtime.showTime",
        "movie.movieId",
        "movie.title",
        "hall.hallId",
        "hall.hallNumber",
        "tariff.tariffId",
        "tariff.name",
        "tariff.priceMultiplier",
      ])
      .getOne();
  }

  async createShowtime(data) {
    try {
      const tariff = await this.#dataSource.getRepository("Tariff").findOne({
        where: {
          startTime: LessThanOrEqual(data.showTime),
          endTime: MoreThan(data.showTime),
          deletedAt: null,
        },
      });

      if (!tariff) {
        throw new Error("No tariff for this showtime");
      }

      return await this.#repo.save({
        ...data,
        tariffId: tariff.tariffId,
      });
    } catch (error) {
      handleDatabaseError(error, ShowtimeErrorMessages.SHOWTIME_ALREADY_EXISTS);
    }
  }

  async updateShowtime(showtimeId, updateData) {
    try {
      return await this.#dataSource.transaction(async (manager) => {
        const { showTime, ...rest } = updateData;

        const showtime = await manager.findOne("Showtime", {
          where: { showtimeId, deletedAt: null },
          select: [
            "showtimeId",
            "hallId",
            "movieId",
            "showDate",
            "showTime",
            "tariffId",
          ],
          lock: { mode: "pessimistic_write" },
        });

        if (!showtime) {
          throw new Error(ShowtimeErrorMessages.SHOWTIME_NOT_FOUND);
        }

        const oldShowTime = showtime.showTime;

        if (showTime && showTime !== oldShowTime) {
          const bookingCount = await manager.count("BookingSeat", {
            where: { showtimeId, status: BookingSeatStatus.ACTIVE },
          });

          if (bookingCount > 0) {
            throw new Error(ShowtimeErrorMessages.SHOWTIME_UPDATE_ERROR);
          }

          const newTariff = await manager.findOne("Tariff", {
            where: {
              startTime: LessThanOrEqual(showTime),
              endTime: MoreThan(showTime),
              deletedAt: null,
            },
          });

          if (!newTariff) {
            throw new Error("No tariff found for the updated showtime");
          }

          showtime.showTime = showTime;
          showtime.tariffId = newTariff.tariffId;
        }

        Object.assign(showtime, rest);

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
