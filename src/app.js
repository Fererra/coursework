import express from "express";
import AppDataSource from "./database/data-source.js";
import movieRouter from "./movie/movie.router.js";
import authRouter from "./auth/auth.router.js";
import tariffRouter from "./tariff/tariff.router.js";

const app = express();

app.use(express.json());

app.use("/movies", movieRouter);
app.use("/auth", authRouter);
app.use("/tariffs", tariffRouter);

AppDataSource.initialize()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) =>
    console.log("Error during Data Source initialization:", error)
  );