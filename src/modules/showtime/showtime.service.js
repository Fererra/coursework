import { showtimeRepository } from "../../database/repositories/showtime.repository.js";
import { ShowtimeErrorMessages } from "./showtime.errors.js";
import { bookingService } from "../../modules/booking/booking.service.js";
import { cinemaHallService } from "../cinema-hall/cinema-hall.service.js";
import { tariffService } from "../tariff/tariff.service.js";
import { handleDatabaseError } from "../../common/utils/db-errors.js";

class ShowtimeService {
  #showtimeRepository;
  #bookingService;
  #cinemaHallService;
  #tariffService;

  constructor(showtimeRepository, bookingService) {
    this.#showtimeRepository = showtimeRepository;
    this.#bookingService = bookingService;
    this.#cinemaHallService = cinemaHallService;
    this.#tariffService = tariffService;
  }

  async getAllShowtimes(page, pageSize) {
    const showtimes = await this.#showtimeRepository.getAllShowtimes(
      page,
      pageSize
    );

    const result = showtimes.reduce((acc, showtime) => {
      const movieId = showtime.movie.movieId;
      if (!acc[movieId]) {
        acc[movieId] = {
          movieId,
          title: showtime.movie.title,
          showtimes: [],
        };
      }
      acc[movieId].showtimes.push({
        showtimeId: showtime.showtimeId,
        showDate: showtime.showDate,
        showTime: showtime.showTime,
      });
      return acc;
    }, {});

    return Object.values(result);
  }

  async getHallPlan(showtimeId) {
    const showtime = await this.#showtimeRepository.getShowtimeDetails(
      showtimeId
    );

    if (!showtime) {
      throw new Error(ShowtimeErrorMessages.SHOWTIME_NOT_FOUND);
    }

    const hallSeats =
      await this.#cinemaHallService.getCinemaHallSeatsByShowtime(
        showtimeId,
        showtime.hall.hallId
      );

    const seats = hallSeats.map((seat) => ({
      seatId: seat.seatId,
      row: seat.rowNumber,
      number: seat.seatNumber,
      seatType: seat.seatType,
      basePrice: seat.basePrice,
      finalPrice: Number(
        (seat.basePrice * showtime.tariff.priceMultiplier).toFixed(2)
      ),
      isBooked: seat.bookings.length > 0,
    }));

    return {
      showtimeId: showtime.showtimeId,
      hallId: showtime.hall.hallId,
      seats,
    };
  }

  getBookings(showtimeId) {
    return this.#bookingService.getBookingsByShowtime(showtimeId);
  }

  bookSeats(showtimeId, seatIds, userId) {
    return this.#bookingService.bookSeats(showtimeId, seatIds, userId);
  }

  async getShowtimeDetails(showtimeId) {
    const showtimeDetails = await this.#showtimeRepository.getShowtimeDetails(
      showtimeId
    );

    if (!showtimeDetails) {
      throw new Error(ShowtimeErrorMessages.SHOWTIME_NOT_FOUND);
    }

    return showtimeDetails;
  }

  async createShowtime(showtimeData) {
    this.#validateShowtimeNotInPast(showtimeData);

    const tariff = await this.#tariffService.getTariffByShowTime(
      showtimeData.showTime
    );

    try {
      return await this.#showtimeRepository.createShowtime(
        showtimeData,
        tariff.tariffId
      );
    } catch (error) {
      handleDatabaseError(error, ShowtimeErrorMessages.SHOWTIME_ALREADY_EXISTS);
    }
  }

  async updateShowtime(showtimeId, updateData) {
    const existing = await this.#showtimeRepository.getShowtimeDetails(
      showtimeId
    );

    if (!existing) {
      throw new Error(ShowtimeErrorMessages.SHOWTIME_NOT_FOUND);
    }

    const showDate = updateData.showDate ?? existing.showDate;
    const showTime = updateData.showTime ?? existing.showTime;

    this.#validateShowtimeNotInPast({ showDate, showTime });

    try {
      return await this.#showtimeRepository.updateShowtime(
        showtimeId,
        updateData
      );
    } catch (error) {
      handleDatabaseError(error, ShowtimeErrorMessages.SHOWTIME_ALREADY_EXISTS);
    }
  }

  #validateShowtimeNotInPast({ showDate, showTime }) {
    if (!showDate || !showTime) return;

    const showDateTime = new Date(`${showDate}T${showTime}`);
    const now = new Date();

    if (showDateTime < now) {
      throw new Error(ShowtimeErrorMessages.SHOWTIME_IN_PAST);
    }
  }

  deleteShowtime(showtimeId) {
    return this.#showtimeRepository.deleteShowtime(showtimeId);
  }
}

export const showtimeService = new ShowtimeService(
  showtimeRepository,
  bookingService,
  cinemaHallService,
  tariffService
);
