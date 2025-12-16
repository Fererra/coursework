import { tariffRepository } from "../../database/repositories/tariff.repository.js";

class TariffService {
  #tariffRepository;

  constructor(tariffRepository) {
    this.#tariffRepository = tariffRepository;
  }

  getAllTariffs() {
    return this.#tariffRepository.getAllTariffs();
  }

  async getTariffByShowTime(showTime) {
    const tariff = await this.#tariffRepository.getTariffByShowTime(showTime);

    if (!tariff) {
      throw new Error("No applicable tariff found for the given show time.");
    }

    return tariff;
  }

  async createTariff(data) {
    try {
      return await this.#tariffRepository.createTariff(data);
    } catch (error) {
      handleDatabaseError(error, TariffErrorMessages.TARIFF_ALREADY_EXISTS);
    }
  }

  async updateTariff(tariffId, updateData) {
    try {
      return await this.#tariffRepository.updateTariff(tariffId, updateData);
    } catch (error) {
      handleDatabaseError(error, TariffErrorMessages.TARIFF_ALREADY_EXISTS);
    }
  }

  deleteTariff(tariffId) {
    return this.#tariffRepository.deleteTariff(tariffId);
  }
}

export const tariffService = new TariffService(tariffRepository);
