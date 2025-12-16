import AppDataSource from "../data-source.js";
import { TariffErrorMessages } from "../../modules/tariff/tariff.errors.js";
import { BookingSeatStatus } from "../../modules/booking/booking-seat-status.js";
import { LessThanOrEqual, MoreThan } from "typeorm";

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
      order: { startTime: "ASC" },
    });
  }

  getTariffByShowTime(showTime) {
    return this.#repo.findOne({
      where: {
        startTime: LessThanOrEqual(showTime),
        endTime: MoreThan(showTime),
        deletedAt: null,
      },
      select: ["tariffId", "name", "startTime", "endTime", "priceMultiplier"],
    });
  }

  createTariff(data) {
    return this.#repo.save(data);
  }

  updateTariff(tariffId, updateData) {
    return this.#dataSource.transaction(async (manager) => {
      const tariff = await manager.findOne("Tariff", {
        select: ["tariffId", "name"],
        where: { tariffId, deletedAt: null },
        lock: { mode: "pessimistic_write" },
      });

      if (!tariff) {
        throw new Error(TariffErrorMessages.TARIFF_NOT_FOUND);
      }

      Object.assign(tariff, updateData);

      return manager.save("Tariff", tariff);
    });
  }

  deleteTariff(tariffId) {
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
