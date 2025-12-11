import { AuthErrorMessages } from "../auth/auth.errors.js";
import { usersRepository } from "../database/repositories/users.repository.js";

class UsersService {
  #usersRepository;

  constructor(usersRepository) {
    this.#usersRepository = usersRepository;
  }

  async findByEmail(email) {
    const user = await this.#usersRepository.findByEmail(email);

    if (!user) {
      throw new Error(AuthErrorMessages.USER_NOT_FOUND);
    }

    return user;
  }

  createUser(data) {
    return this.#usersRepository.createUser(data);
  }
}

export const usersService = new UsersService(usersRepository);