import { Router } from "express";
import moviesReportsRouter from "./movies/movies-reports.router.js";
import usersReportsRouter from "./users/users-reports.router.js";

const reportsRouter = Router();

reportsRouter.use("/movies", moviesReportsRouter);
reportsRouter.use("/users", usersReportsRouter);

export default reportsRouter;