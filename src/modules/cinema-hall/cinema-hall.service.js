import { cinemaHallRepository } from "../../database/repositories/cinema-hall.repository.js";
import { CinemaHallErrorMessages } from "./cinema-hall.errors.js";

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

  createCinemaHall(data) {
    return this.#cinemaHallRepository.createCinemaHall(data);
  }

  updateCinemaHall(cinemaHallId, updateData) {
    return this.#cinemaHallRepository.updateCinemaHall(
      cinemaHallId,
      updateData
    );
  }

  deleteCinemaHall(cinemaHallId) {
    return this.#cinemaHallRepository.deleteCinemaHall(cinemaHallId);
  }
}

export const cinemaHallService = new CinemaHallService(cinemaHallRepository);
