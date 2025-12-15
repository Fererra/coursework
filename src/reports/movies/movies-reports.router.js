import { Router } from "express";
import { moviesReportsService } from "./movies-reports.service.js";

const moviesReportsRouter = Router();

moviesReportsRouter.get("/revenue", async (_req, res) => {
  const report = await moviesReportsService.getMoviesRevenueReport();
  return res.json(report);
});

moviesReportsRouter.get("/attendance", async (_req, res) => {
  const report = await moviesReportsService.getMoviesAttendanceReport();
  return res.json(report);
});

export default moviesReportsRouter;
