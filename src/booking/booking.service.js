import { bookingRepository } from "../database/repositories/booking.repository.js";

export class BookingService {
  #bookingRepository;

  constructor(bookingRepository) {
    this.#bookingRepository = bookingRepository;
  }

  getUserBookings(userId) {
    return this.#bookingRepository.getBookingsByUserId(userId);
  }

  getBookingsByShowtime(showtimeId) {
    return this.#bookingRepository.getBookingsByShowtime(showtimeId);
  }

  bookSeats(showtimeId, seatIds, userId) {
    return this.#bookingRepository.bookSeats(showtimeId, seatIds, userId);
  }

  async getBookingById(bookingId) {
    const booking = await this.#bookingRepository.getBookingById(bookingId);

    if (!booking) {
      throw new Error(BookingErrorMessages.BOOKING_NOT_FOUND);
    }

    return booking;
  }

  cancelBooking(bookingId) {
    return this.#bookingRepository.cancelBooking(bookingId);
  }
}

export const bookingService = new BookingService(bookingRepository);
