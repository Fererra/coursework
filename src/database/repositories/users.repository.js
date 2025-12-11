import AppDataSource from "../data-source.js";
import { AuthErrorMessages } from "../../auth/auth.errors.js";

class UsersRepository {
  #repo;

  constructor(dataSource) {
    this.#repo = dataSource.getRepository("User");
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
}

export const usersRepository = new UsersRepository(AppDataSource);