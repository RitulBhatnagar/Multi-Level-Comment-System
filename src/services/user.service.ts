import { PrismaClient, User, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import logger from "../utils/logger";
import jwt from "jsonwebtoken";
import APIError, { HttpStatusCode } from "../middlewares/errorMiddleware";
import { ErrorCommonStrings, localConstant } from "../utils/constant";

const prisma = new PrismaClient();

/**
 * Service function to register a new user.
 *
 * @param {string} name - The name of the user.
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @return {Promise<User>} The created user object.
 * @throws {APIError} If there is an error during the registration process.
 */
export const registerUserService = async (
  name: string,
  email: string,
  password: string
): Promise<User> => {
  try {
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });
    logger.info(`User registered successfully: ${user.id}`);
    return user;
  } catch (error) {
    logger.error("Error while registering user", error);

    // If the error is an instance of APIError, rethrow it
    if (error instanceof APIError) {
      throw error;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma-specific errors
      if (error.code === "P2002") {
        throw new APIError(
          ErrorCommonStrings.NOT_ALLOWED,
          HttpStatusCode.NOT_ALLOWED,
          true,
          localConstant.USER_ALREADY_EXISIT
        );
      }
    }

    // Throw a new APIError with a generic internal server error message
    throw new APIError(
      ErrorCommonStrings.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_ERROR,
      false,
      localConstant.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Service function to login a user.
 *
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @return {Promise<string>} The authentication token for the user.
 * @throws {APIError} If there is an error during the login process.
 */
export const loginUserService = async (email: string, password: string) => {
  try {
    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    // If the user does not exist, throw a NOT_FOUND error
    if (!user) {
      throw new APIError(
        ErrorCommonStrings.NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
        true,
        localConstant.USER_NOT_FOUND
      );
    }

    // Compare the password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If the password is invalid, throw an UNAUTHORIZED_REQUEST error
    if (!isPasswordValid) {
      throw new APIError(
        ErrorCommonStrings.UNAUTHORIZED_REQUEST,
        HttpStatusCode.UNAUTHORIZED_REQUEST,
        true,
        localConstant.INVALID_PASSWORD
      );
    }

    // Generate an authentication token for the user
    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.ACCESS_TOKEN_SECRET || "",
      {
        expiresIn: "24h",
      }
    );

    // Return the authentication token
    return token;
  } catch (error) {
    if (error instanceof APIError) {
      // If the error is an instance of APIError, rethrow it
      throw error;
    }

    // Throw a new APIError with a generic internal server error message
    throw new APIError(
      ErrorCommonStrings.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_ERROR,
      false,
      localConstant.INTERNAL_SERVER_ERROR
    );
  }
};
