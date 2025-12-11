import { UserRole } from "../../users/user-role.js";
import AppDataSource from "../data-source.js";
import { AuthErrorMessages } from "../../auth/auth.errors.js";

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
      withDeleted: true,
    });
  }

  createUser(data) {
    try {
      return this.#repo.save(data);
    } catch (error) {
      if (error.code === "23505") {
        throw new Error(AuthErrorMessages.USER_ALREADY_EXISTS);
      }
    }
  }

  getUserById(userId) {
    return this.#repo.findOne({
      select: ["userId", "firstName", "lastName", "email"],
      where: { userId, deletedAt: null },
    });
  }

  async updateUserData(userId, updateData) {
    return this.#dataSource.transaction(async (manager) => {
      const user = await manager.findOne("User", {
        select: ["userId", "firstName", "lastName", "email"],
        where: { userId, deletedAt: null },
      });

      if (!user) {
        throw new Error(AuthErrorMessages.USER_NOT_FOUND);
      }

      Object.assign(user, updateData);

      try {
        return await manager.save("User", user);
      } catch (error) {
        if (error.code === "23505") {
          throw new Error(AuthErrorMessages.USER_ALREADY_EXISTS);
        }
        throw error;
      }
    });
  }

  async deleteUser(userId) {
    return this.#dataSource.transaction(async (manager) => {
      const user = await manager.findOne("User", {
        where: { userId, deletedAt: null },
      });

      if (!user) {
        throw new Error(AuthErrorMessages.USER_NOT_FOUND);
      }

      if (user.role === UserRole.ADMIN) {
        throw new Error("Cannot delete admin accounts");
      }

      await manager.softDelete("User", { userId });

      return { message: "User deleted successfully" };
    });
  }
}

export const usersRepository = new UsersRepository(AppDataSource);