import { AuthErrorMessages } from "../../modules/auth/auth.errors.js";
import { usersRepository } from "../../database/repositories/users.repository.js";
import { bookingService } from "../../modules/booking/booking.service.js";

class UsersService {
  #usersRepository;
  #bookingService;

  constructor(usersRepository, bookingService) {
    this.#usersRepository = usersRepository;
    this.#bookingService = bookingService;
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

  async getUserData(userId) {
    const data = await this.#usersRepository.getUserById(userId);

    if (!data) {
      throw new Error(AuthErrorMessages.USER_NOT_FOUND);
    }

    return data;
  }

  getUserBookings(userId) {
    return this.#bookingService.getUserBookings(userId);
  }

  async updateUserData(userId, updateData) {
    return this.#usersRepository.updateUserData(userId, updateData);
  }

  async deleteUser(userId) {
    return this.#usersRepository.deleteUser(userId);
  }
}

export const usersService = new UsersService(usersRepository, bookingService);
