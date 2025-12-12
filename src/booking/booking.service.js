import { bookingRepository } from "../database/repositories/booking.repository.js";

export class BookingService {
  #bookingRepository;

  constructor(bookingRepository) {
    this.#bookingRepository = bookingRepository;
  }

  getUserBookings(userId) {
    return this.#bookingRepository.getBookingsByUserId(userId);
  }

  bookSeats(showtimeId, seatIds, userId) {
    return this.#bookingRepository.bookSeats(showtimeId, seatIds, userId);
  }
}

export const bookingService = new BookingService(bookingRepository);
