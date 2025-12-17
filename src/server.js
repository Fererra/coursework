import app from "./app.js";
import AppDataSource from "./database/data-source.js";

const PORT = 3000;

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
    process.exit(1);
  });
