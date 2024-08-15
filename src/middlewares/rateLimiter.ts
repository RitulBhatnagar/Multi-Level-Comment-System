import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import APIError, { HttpStatusCode } from "../middlewares/errorMiddleware";
import { ErrorCommonStrings, localConstant } from "../utils/constant";

const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each user to 10 requests per windowMs
  message: "Too many comments created, please try again after 15 minutes.",
  headers: true,
  keyGenerator: (req: Request) => req.body.user?.id || req.ip,
  handler: (req: Request, res: Response) => {
    throw new APIError(
      ErrorCommonStrings.TOO_MANY_REQUEST,
      HttpStatusCode.TOO_MANY_REQUESTS,
      true,
      "Comment rate limit exceeded. Try again later."
    );
  },
});

export const commentRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.body.user;
  if (!user) {
    return next(
      new APIError(
        ErrorCommonStrings.NOT_AUTHORIZED,
        HttpStatusCode.UNAUTHORIZED,
        true,
        "Authentication required for comment rate limiting"
      )
    );
  }

  commentLimiter(req, res, next);
};
