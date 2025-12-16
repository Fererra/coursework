import { AuthErrorMessages } from "../auth/auth.errors.js";
import { usersRepository } from "../../database/repositories/users.repository.js";
import { bookingService } from "../booking/booking.service.js";
import { buildPaginationResponse } from "../../common/utils/pagination.util.js";
import { handleDatabaseError } from "../../common/utils/db-errors.js";

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

  async createUser(data) {
    try {
      return await this.#usersRepository.createUser(data);
    } catch (error) {
      handleDatabaseError(error, AuthErrorMessages.USER_ALREADY_EXISTS);
    }
  }

  async getUserData(userId) {
    const data = await this.#usersRepository.getUserById(userId);

    if (!data) {
      throw new Error(AuthErrorMessages.USER_NOT_FOUND);
    }

    return data;
  }

  async getUserBookings(userId, page, pageSize) {
    const [bookings, total] = await this.#bookingService.getUserBookings(
      userId,
      page,
      pageSize
    );

    return buildPaginationResponse(bookings, total, page, pageSize);
  }

  async updateUserData(userId, updateData) {
    try {
      return await this.#usersRepository.updateUserData(userId, updateData);
    } catch (error) {
      handleDatabaseError(error, AuthErrorMessages.USER_ALREADY_EXISTS);
    }
  }

  deleteUser(userId) {
    return this.#usersRepository.deleteUser(userId);
  }
}

export const usersService = new UsersService(usersRepository, bookingService);