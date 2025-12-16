import { showtimeRepository } from "../../database/repositories/showtime.repository.js";
import { ShowtimeErrorMessages } from "./showtime.errors.js";
import { bookingService } from "../../modules/booking/booking.service.js";

class ShowtimeService {
  #showtimeRepository;
  #bookingService;

  constructor(showtimeRepository, bookingService) {
    this.#showtimeRepository = showtimeRepository;
    this.#bookingService = bookingService;
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
    const hallPlan = await this.#showtimeRepository.getHallPlan(showtimeId);

    if (!hallPlan) {
      throw new Error(ShowtimeErrorMessages.SHOWTIME_NOT_FOUND);
    }

    return hallPlan;
  }

  getBookings(showtimeId, page, pageSize) {
    return this.#bookingService.getBookingsByShowtime(
      showtimeId,
      page,
      pageSize
    );
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

  createShowtime(showtimeData) {
    this.#validateShowtimeNotInPast(showtimeData);

    return this.#showtimeRepository.createShowtime(showtimeData);
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

    return this.#showtimeRepository.updateShowtime(showtimeId, updateData);
  }

  #validateShowtimeNotInPast({ showDate, showTime }) {
    if (!showDate || !showTime) return;

    const showDateTime = new Date(`${showDate}T${showTime}`);
    const now = new Date();

    if (showDateTime < now) {
      throw new Error(ShowtimeErrorMessages.SHOWTIME_IN_PAST);
    }
  }

  async deleteShowtime(showtimeId) {
    return this.#showtimeRepository.deleteShowtime(showtimeId);
  }
}

export const showtimeService = new ShowtimeService(
  showtimeRepository,
  bookingService
);
