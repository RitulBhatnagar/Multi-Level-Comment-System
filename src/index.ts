import express from "express";
import dotenv from "dotenv";
import logger from "./utils/logger";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  logger.info("Received request for root path");
  res.send("Health status is up and running ✅");
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

export default app;
