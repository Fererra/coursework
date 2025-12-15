import { Router } from "express";
import { usersReportsService } from "./users-reports.service.js";

const usersReportsRouter = Router();

usersReportsRouter.get("/spending", async (_req, res) => {
  const report = await usersReportsService.getUsersSpendingReport();
  return res.json(report);
});

export default usersReportsRouter;