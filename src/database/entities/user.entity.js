import { EntitySchema } from "typeorm";
import { UserRole } from "../../users/user-role.js";

export const UserEntity = new EntitySchema({
  name: "User",
  tableName: "user",
  columns: {
    userId: {
      name: "user_id",
      primary: true,
      type: "int",
      generated: "increment",
    },
    firstName: {
      name: "first_name",
      type: "varchar",
      length: 100,
      nullable: false,
    },
    lastName: {
      name: "last_name",
      type: "varchar",
      length: 100,
      nullable: false,
    },
    email: {
      type: "varchar",
      length: 255,
      unique: true,
      nullable: false,
    },
    password: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    role: {
      type: "enum",
      enum: Object.values(UserRole),
      default: UserRole.USER,
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
  relations: {
    bookings: {
      type: "one-to-many",
      target: "Booking",
      inverseSide: "customer",
    },
  },
});
