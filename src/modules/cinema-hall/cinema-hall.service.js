import { cinemaHallRepository } from "../../database/repositories/cinema-hall.repository.js";
import { CinemaHallErrorMessages } from "./cinema-hall.errors.js";
import { handleDatabaseError } from "../../common/utils/db-errors.js";

class CinemaHallService {
  #cinemaHallRepository;

  constructor(cinemaHallRepository) {
    this.#cinemaHallRepository = cinemaHallRepository;
  }

  getAllCinemaHalls() {
    return this.#cinemaHallRepository.getAllCinemaHalls();
  }

  async getCinemaHallDetails(cinemaHallId) {
    const cinemaHallDetails =
      await this.#cinemaHallRepository.getCinemaHallDetails(cinemaHallId);

    if (!cinemaHallDetails) {
      throw new Error(CinemaHallErrorMessages.CINEMA_HALL_NOT_FOUND);
    }

    return cinemaHallDetails;
  }

  getCinemaHallSeatsByShowtime(showtimeId, hallId) {
    return this.#cinemaHallRepository.getCinemaHallSeatsByShowtime(
      showtimeId,
      hallId
    );
  }

  async createCinemaHall(data) {
    try {
      return await this.#cinemaHallRepository.createCinemaHall(data);
    } catch (error) {
      handleDatabaseError(
        error,
        CinemaHallErrorMessages.CINEMA_HALL_ALREADY_EXISTS
      );
    }
  }

  async updateCinemaHall(cinemaHallId, updateData) {
    try {
      return await this.#cinemaHallRepository.updateCinemaHall(
        cinemaHallId,
        updateData
      );
    } catch (error) {
      handleDatabaseError(
        error,
        CinemaHallErrorMessages.CINEMA_HALL_ALREADY_EXISTS
      );
    }
  }

  deleteCinemaHall(cinemaHallId) {
    return this.#cinemaHallRepository.deleteCinemaHall(cinemaHallId);
  }
}

export const cinemaHallService = new CinemaHallService(cinemaHallRepository);