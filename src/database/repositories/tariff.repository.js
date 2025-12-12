import AppDataSource from "../data-source.js";
import { TariffErrorMessages } from "../../tariff/tariff.errors.js";

class TariffRepository {
  #repo;
  #dataSource;

  constructor(dataSource) {
    this.#repo = dataSource.getRepository("Tariff");
    this.#dataSource = dataSource;
  }

  getAllTariffs() {
    return this.#repo.find({
      select: ["tariffId", "name", "startTime", "endTime", "priceMultiplier"],
      where: { deletedAt: null },
    });
  }

  async createTariff(data) {
    return this.#dataSource.transaction(async (manager) => {
      try {
        const tariff = manager.create("Tariff", data);
        await manager.save("Tariff", tariff);
        return tariff;
      } catch (error) {
        if (error.code === "23505") {
          throw new Error(TariffErrorMessages.TARIFF_ALREADY_EXISTS);
        }
        throw error;
      }
    });
  }

  async updateTariff(tariffId, updateData) {
    return this.#dataSource.transaction(async (manager) => {
      const tariff = await manager.findOne("Tariff", {
        select: ["tariffId", "name"],
        where: { tariffId, deletedAt: null },
      });

      if (!tariff) {
        throw new Error(TariffErrorMessages.TARIFF_NOT_FOUND);
      }

      Object.assign(tariff, updateData);

      try {
        await manager.save("Tariff", tariff);
        return tariff;
      } catch (error) {
        if (error.code === "23505") {
          throw new Error(TariffErrorMessages.TARIFF_ALREADY_EXISTS);
        }
        throw error;
      }
    });
  }

  async deleteTariff(tariffId) {
    return this.#dataSource.transaction(async (manager) => {
      const tariff = await manager.findOne("Tariff", {
        where: { tariffId, deletedAt: null },
      });

      if (!tariff) throw new Error(TariffErrorMessages.TARIFF_NOT_FOUND);

      await manager.softDelete("Tariff", { tariffId });

      return { message: "Tariff deleted successfully" };
    });
  }
}

export const tariffRepository = new TariffRepository(AppDataSource);