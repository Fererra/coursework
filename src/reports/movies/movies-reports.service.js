import { reportsRepository } from "../../database/repositories/reports.repository.js";

class MoviesReportsService {
  #reportsRepository;

  constructor(reportsRepository) {
    this.#reportsRepository = reportsRepository;
  }

  getMoviesRevenueReport() {
    return this.#reportsRepository.getMoviesRevenueReport();
  }

  getMoviesAttendanceReport() {
    return this.#reportsRepository.getMoviesAttendanceReport();
  }
}

export const moviesReportsService = new MoviesReportsService(reportsRepository);
