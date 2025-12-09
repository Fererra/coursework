import AppDataSource from "./database/data-source.js";

AppDataSource.initialize()
  .then(() => {
    console.log("Database is running");
  })
  .catch((error) =>
    console.log("Error during Data Source initialization:", error)
  );
