import { Request, Response } from "express";
import logger from "../utils/logger";

export const healthCheck = async (req: Request, res: Response) => {
  logger.info("Received request for health check");
  return res.status(200).json({ message: "Health check successful" });
};
