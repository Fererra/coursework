import { tariffRepository } from "./../database/repositories/tariff.repository.js";

class TariffService {
  #tariffRepository;

  constructor(tariffRepository) {
    this.#tariffRepository = tariffRepository;
  }

  getAllTariffs() {
    return this.#tariffRepository.getAllTariffs();
  }

  createTariff(data) {
    return this.#tariffRepository.createTariff(data);
  }

  updateTariff(tariffId, updateData) {
    return this.#tariffRepository.updateTariff(tariffId, updateData);
  }

  deleteTariff(tariffId) {
    return this.#tariffRepository.deleteTariff(tariffId);
  }
}

export const tariffService = new TariffService(tariffRepository);