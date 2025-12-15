import { reportsRepository } from "../../database/repositories/reports.repository.js";

class UsersReportsService {
  #reportsRepository;

  constructor(reportsRepository) {
    this.#reportsRepository = reportsRepository;
  }

  getUsersSpendingReport() {
    return this.#reportsRepository.getUsersSpendingReport();
  }
}

export const usersReportsService = new UsersReportsService(reportsRepository);