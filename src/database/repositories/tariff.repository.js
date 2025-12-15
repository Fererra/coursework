import AppDataSource from "../data-source.js";
import { TariffErrorMessages } from "../../modules/tariff/tariff.errors.js";
import { handleDatabaseError } from "../../common/utils/db-errors.js";
import { BookingSeatStatus } from "../../modules/booking/booking-seat-status.js";

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
    try {
      return await this.#repo.save(data);
    } catch (error) {
      handleDatabaseError(error, TariffErrorMessages.TARIFF_ALREADY_EXISTS);
    }
  }

  async updateTariff(tariffId, updateData) {
    try {
      return await this.#dataSource.transaction(async (manager) => {
        const tariff = await manager.findOne("Tariff", {
          select: ["tariffId", "name"],
          where: { tariffId, deletedAt: null },
          lock: { mode: "pessimistic_write" },
        });

        if (!tariff) {
          throw new Error(TariffErrorMessages.TARIFF_NOT_FOUND);
        }

        Object.assign(tariff, updateData);

        return await manager.save("Tariff", tariff);
      });
    } catch (error) {
      handleDatabaseError(error, TariffErrorMessages.TARIFF_ALREADY_EXISTS);
    }
  }

  async deleteTariff(tariffId) {
    return this.#dataSource.transaction(async (manager) => {
      const tariff = await manager.findOne("Tariff", {
        where: { tariffId, deletedAt: null },
        lock: { mode: "pessimistic_write" },
      });

      if (!tariff) throw new Error(TariffErrorMessages.TARIFF_NOT_FOUND);

      const bookingCount = await manager.count("BookingSeat", {
        where: { tariffId, status: BookingSeatStatus.ACTIVE },
      });

      if (bookingCount > 0) {
        throw new Error(TariffErrorMessages.TARIFF_HAS_BOOKINGS);
      }

      await manager.softDelete("Tariff", { tariffId });

      return { message: "Tariff deleted successfully" };
    });
  }
}

export const tariffRepository = new TariffRepository(AppDataSource);