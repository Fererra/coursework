import express from "express";
import AppDataSource from "./database/data-source.js";
import authRouter from "./auth/auth.router.js";

const app = express();

app.use(express.json());

app.use("/auth", authRouter);

AppDataSource.initialize()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) =>
    console.log("Error during Data Source initialization:", error)
  );
