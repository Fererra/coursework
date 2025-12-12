import { EntitySchema } from "typeorm";

export const TariffEntity = new EntitySchema({
  name: "Tariff",
  tableName: "tariff",
  columns: {
    tariffId: {
      name: "tariff_id",
      primary: true,
      type: "int",
      generated: "increment",
    },
    name: {
      type: "varchar",
      length: 30,
      unique: true,
      nullable: false,
    },
    startTime: {
      name: "start_time",
      type: "time",
      nullable: false,
    },
    endTime: {
      name: "end_time",
      type: "time",
      nullable: false,
    },
    priceMultiplier: {
      name: "price_multiplier",
      type: "decimal",
      precision: 3,
      scale: 2,
      nullable: false,
    },
    createdAt: {
      name: "created_at",
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      name: "updated_at",
      type: "timestamp",
      updateDate: true,
    },
    deletedAt: {
      name: "deleted_at",
      type: "timestamp",
      nullable: true,
      deleteDate: true,
    },
  },
  checks: [
    { expression: "price_multiplier > 0" },
    { expression: "start_time < end_time" },
  ],
  relations: {
    bookingSeats: {
      type: "one-to-many",
      target: "BookingSeat",
      inverseSide: "tariff",
    },
  },
});