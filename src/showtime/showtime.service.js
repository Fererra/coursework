import { showtimeRepository } from "../database/repositories/showtime.repository.js";
import { ShowtimeErrorMessages } from "./showtime.errors.js";
import { bookingService } from "../booking/booking.service.js";

class ShowtimeService {
  #showtimeRepository;
  #bookingService;

  constructor(showtimeRepository, bookingService) {
    this.#showtimeRepository = showtimeRepository;
    this.#bookingService = bookingService;
  }

  getAllShowtimes() {
    return this.#showtimeRepository.getAllShowtimes();
  }

  async getHallPlan(showtimeId) {
    const hallPlan = await this.#showtimeRepository.getHallPlan(showtimeId);

    if (!hallPlan) {
      throw new Error(ShowtimeErrorMessages.SHOWTIME_NOT_FOUND);
    }

    return hallPlan;
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

  createShowtime(showtimeData) {
    return this.#showtimeRepository.createShowtime(showtimeData);
  }

  updateShowtime(showtimeId, updateData) {
    return this.#showtimeRepository.updateShowtime(showtimeId, updateData);
  }

  async deleteShowtime(showtimeId) {
    return this.#showtimeRepository.deleteShowtime(showtimeId);
  }
}

export const showtimeService = new ShowtimeService(
  showtimeRepository,
  bookingService
);
