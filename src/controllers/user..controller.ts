import { Request, Response } from "express";
import {
  loginUserService,
  registerUserService,
} from "../services/user.service";
import logger from "../utils/logger";
import APIError, { HttpStatusCode } from "../middlewares/errorMiddleware";
import { localConstant } from "../utils/constant";

/**
 * Controller function to handle user registration.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} The response object containing the created user.
 */
export const registerUser = async (req: Request, res: Response) => {
  // Destructure the request body to get the user details
  const { name, email, password } = req.body;

  try {
    // Call the service function to register the user
    const registerUser = await registerUserService(name, email, password);

    // Return the response with the created user
    return res.status(HttpStatusCode.CREATED).json({
      message: "User created successfully",
      registerUser,
    });
  } catch (error) {
    // Log the error if any
    logger.error("Error in registering user", error);

    // If the error is an instance of APIError, return the appropriate error response
    if (error instanceof APIError) {
      return res
        .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          message: error.message || localConstant.USER_NOT_CREATED,
        });
    }

    // Return the internal server error response
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: localConstant.USER_NOT_CREATED,
    });
  }
};

/**
 * Controller function to handle user login.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} The response object containing the logged in user.
 */
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Call the service function to login the user
    const loginUser = await loginUserService(email, password);

    // Return the response with the logged in user
    return res.status(HttpStatusCode.OK).json({
      message: "User logged in successfully",
      loginUser,
    });
  } catch (error) {
    // Log the error if any
    logger.error("Error in logging in user", error);

    // If the error is an instance of APIError, return the appropriate error response
    if (error instanceof APIError) {
      return res
        .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          message: error.message || localConstant.USER_NOT_LOGGED_IN,
        });
    }

    // Return the internal server error response
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: localConstant.INTERNAL_SERVER_ERROR,
    });
  }
};
