import { UserRole } from "../../modules/users/user-role.js";
import AppDataSource from "../data-source.js";
import { AuthErrorMessages } from "../../modules/auth/auth.errors.js";

class UsersRepository {
  #repo;
  #dataSource;

  constructor(dataSource) {
    this.#repo = dataSource.getRepository("User");
    this.#dataSource = dataSource;
  }

  findByEmail(email) {
    return this.#repo.findOne({
      select: ["userId", "email", "password"],
      where: { email },
    });
  }

  createUser(data) {
    return this.#repo.save(data);
  }

  getUserById(userId) {
    return this.#repo.findOne({
      select: ["userId", "firstName", "lastName", "email"],
      where: { userId, deletedAt: null },
    });
  }

  updateUserData(userId, updateData) {
    return this.#dataSource.transaction(async (manager) => {
      const user = await manager.findOne("User", {
        select: ["userId", "firstName", "lastName", "email"],
        where: { userId, deletedAt: null },
        lock: { mode: "pessimistic_write" },
      });

      if (!user) {
        throw new Error(AuthErrorMessages.USER_NOT_FOUND);
      }

      Object.assign(user, updateData);

      return manager.save("User", user);
    });
  }

  deleteUser(userId) {
    return this.#dataSource.transaction(async (manager) => {
      const user = await manager.findOne("User", {
        where: { userId, deletedAt: null },
        lock: { mode: "pessimistic_write" },
      });

      const bookingsCount = await manager.count("Booking", {
        where: { user: { userId } },
      });
      if (bookingsCount > 0)
        throw new Error(AuthErrorMessages.USER_HAS_BOOKINGS);

      if (!user) {
        throw new Error(AuthErrorMessages.USER_NOT_FOUND);
      }

      if (user.role === UserRole.ADMIN) {
        throw new Error(AuthErrorMessages.ADMIN_DELETION_ERROR);
      }

      await manager.softDelete("User", { userId });

      return { message: "User deleted successfully" };
    });
  }
}

export const usersRepository = new UsersRepository(AppDataSource);