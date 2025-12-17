import AppDataSource from "../data-source.js";
import { CinemaHallErrorMessages } from "../../modules/cinema-hall/cinema-hall.errors.js";
import { BookingSeatStatus } from "../../modules/booking/booking-seat-status.js";
import { In } from "typeorm";

class CinemaHallRepository {
  #repo;
  #dataSource;

  constructor(dataSource) {
    this.#repo = dataSource.getRepository("CinemaHall");
    this.#dataSource = dataSource;
  }

  getAllCinemaHalls() {
    return this.#repo.find({
      select: ["hallId", "hallNumber", "capacity"],
      where: { deletedAt: null },
    });
  }

  getCinemaHallDetails(hallId) {
    return this.#repo
      .createQueryBuilder("cinemaHall")
      .leftJoinAndSelect("cinemaHall.seats", "seats", "seats.deletedAt IS NULL")
      .select([
        "cinemaHall.hallId",
        "cinemaHall.hallNumber",
        "cinemaHall.capacity",
        "seats.seatId",
        "seats.rowNumber",
        "seats.seatNumber",
        "seats.seatType",
        "seats.basePrice",
      ])
      .where("cinemaHall.hallId = :hallId", { hallId })
      .andWhere("cinemaHall.deletedAt IS NULL")
      .getOne();
  }

  getCinemaHallSeatsByShowtime(showtimeId, hallId) {
    return this.#dataSource
      .getRepository("Seat")
      .createQueryBuilder("seat")
      .leftJoinAndSelect(
        "seat.bookings",
        "bs",
        "bs.showtimeId = :showtimeId AND bs.status = :status",
        { showtimeId, status: BookingSeatStatus.ACTIVE }
      )
      .where("seat.hallId = :hallId AND seat.deletedAt IS NULL", { hallId })
      .select([
        "seat.seatId",
        "seat.rowNumber",
        "seat.seatNumber",
        "seat.seatType",
        "seat.basePrice",
        "bs.seatId",
      ])
      .getMany();
  }

  createCinemaHall(data) {
    return this.#dataSource.transaction(async (manager) => {
      const { seats, ...cinemaHallData } = data;

      const cinemaHall = manager.create("CinemaHall", cinemaHallData);
      await manager.save("CinemaHall", cinemaHall);

      if (seats && seats.length > 0) {
        const seatEntities = seats.map((seat) =>
          manager.create("Seat", {
            ...seat,
            hallId: cinemaHall.hallId,
          })
        );
        cinemaHall.seats = seatEntities;
        await manager.save("Seat", seatEntities);
      }

      return cinemaHall;
    });
  }

  updateCinemaHall(hallId, updateData) {
    return this.#dataSource.transaction(async (manager) => {
      const { seats, ...updateHallData } = updateData;

      const cinemaHall = await manager.findOne("CinemaHall", {
        where: { hallId, deletedAt: null },
        lock: { mode: "pessimistic_write" },
      });

      if (!cinemaHall)
        throw new Error(CinemaHallErrorMessages.CINEMA_HALL_NOT_FOUND);

      cinemaHall.seats = await manager.find("Seat", {
        where: { hallId, deletedAt: null },
      });

      await manager.save("CinemaHall", {
        hallId: cinemaHall.hallId,
        ...updateHallData,
      });

      if (seats) {
        const seatIdsToDelete = seats
          .filter((s) => s.seatId && s.deleted)
          .map((s) => s.seatId);

        if (seatIdsToDelete.length > 0) {
          await manager.softDelete("Seat", { seatId: In(seatIdsToDelete) });
        }

        for (const seatDto of seats) {
          if (seatDto.seatId && seatDto.deleted) {
            continue;
          }

          if (seatDto.seatId && !seatDto.deleted) {
            const existingSeat = cinemaHall.seats.find(
              (s) => s.seatId === seatDto.seatId
            );

            if (!existingSeat)
              throw new Error(CinemaHallErrorMessages.SEAT_NOT_FOUND);

            Object.assign(existingSeat, seatDto);
            await manager.save("Seat", existingSeat);
          } else {
            const newSeat = manager.create("Seat", {
              ...seatDto,
              hallId: cinemaHall.hallId,
            });

            await manager.save("Seat", newSeat);
          }
        }
      }

      cinemaHall.seats = await manager.find("Seat", {
        where: { hallId, deletedAt: null },
      });

      return cinemaHall;
    });
  }

  deleteCinemaHall(hallId) {
    return this.#dataSource.transaction(async (manager) => {
      const hall = await manager
        .getRepository("CinemaHall")
        .createQueryBuilder("cinemahall")
        .where("cinemahall.hallId = :hallId", { hallId })
        .andWhere("cinemahall.deletedAt IS NULL")
        .setLock("pessimistic_write")
        .getOne();

      if (!hall) throw new Error(CinemaHallErrorMessages.CINEMA_HALL_NOT_FOUND);

      hall.showtimes = await manager
        .getRepository("Showtime")
        .find({ where: { hallId, deletedAt: null } });

      if (hall.showtimes.length > 0) {
        throw new Error(CinemaHallErrorMessages.CINEMA_HALL_DELETE_ERROR);
      }

      hall.seats = await manager
        .getRepository("Seat")
        .find({ where: { hallId, deletedAt: null } });

      const seatIdsToDelete = hall.seats.map((s) => s.seatId);

      if (seatIdsToDelete.length > 0) {
        await manager.softDelete("Seat", { seatId: In(seatIdsToDelete) });
      }

      await manager.softDelete("CinemaHall", { hallId });

      return { message: "Cinema hall deleted successfully" };
    });
  }
}

export const cinemaHallRepository = new CinemaHallRepository(AppDataSource);