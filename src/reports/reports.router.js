import { Router } from "express";
import moviesReportsRouter from "./movies/movies-reports.router.js";

const reportsRouter = Router();

reportsRouter.use("/movies", moviesReportsRouter);

export default reportsRouter;