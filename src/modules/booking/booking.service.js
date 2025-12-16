import { bookingRepository } from "../../database/repositories/booking.repository.js";
import { buildPaginationResponse } from "../../common/utils/pagination.util.js";

export class BookingService {
  #bookingRepository;

  constructor(bookingRepository) {
    this.#bookingRepository = bookingRepository;
  }

  async getUserBookings(userId, page, pageSize) {
    const [bookings, total] = await this.#bookingRepository.getBookingsByUserId(
      userId,
      page,
      pageSize
    );

    return buildPaginationResponse(bookings, total, page, pageSize);
  }

  async getBookingsByShowtime(showtimeId, page, pageSize) {
    const [bookings, total] =
      await this.#bookingRepository.getBookingsByShowtime(
        showtimeId,
        page,
        pageSize
      );

    return buildPaginationResponse(bookings, total, page, pageSize);
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
