import express from "express";
import authRouter from "./modules/auth/auth.router.js";
import usersRouter from "./modules/users/users.router.js";
import movieRouter from "./modules/movie/movie.router.js";
import genreRouter from "./modules/genre/genre.router.js";
import tariffRouter from "./modules/tariff/tariff.router.js";
import cinemaHallRouter from "./modules/cinema-hall/cinema-hall.router.js";
import showtimeRouter from "./modules/showtime/showtime.router.js";
import bookingRouter from "./modules/booking/booking.router.js";
import reportsRouter from "./modules/reports/reports.router.js";

const app = express();

app.use(express.json());

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/movies", movieRouter);
app.use("/genres", genreRouter);
app.use("/tariffs", tariffRouter);
app.use("/cinema-halls", cinemaHallRouter);
app.use("/showtimes", showtimeRouter);
app.use("/bookings", bookingRouter);
app.use("/reports", reportsRouter);

export default app;