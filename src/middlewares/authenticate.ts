import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../middlewares/errorMiddleware";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

interface DecodedToken {
  userId: string;
  exp: number;
}

const checkAuthToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(HttpStatusCode.UNAUTHORIZED)
      .json({ message: "Unauthorized: Missing authorization token" });
  }

  if (!ACCESS_TOKEN_SECRET) {
    console.error("ACCESS_TOKEN_SECRET is not defined.");
    return res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }

  console.log("Authorization header:", authHeader);

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET) as DecodedToken;

    console.log("Decoded token:", decodedToken);

    // Check if token has expired
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (decodedToken.exp < currentTimestamp) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: "Unauthorized: Token has expired" });
    }

    req.user = { userId: decodedToken.userId };
    next();
  } catch (error) {
    console.log("Token validation error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: "Unauthorized: Token has expired" });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(HttpStatusCode.UNAUTHORIZED)
        .json({ message: "Unauthorized: Invalid authorization token" });
    }

    return res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error during token validation" });
  }
};

export default checkAuthToken;
