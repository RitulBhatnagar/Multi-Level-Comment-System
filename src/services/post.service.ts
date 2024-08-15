import { PrismaClient, Prisma } from "@prisma/client";
import APIError, { HttpStatusCode } from "../middlewares/errorMiddleware";
import { ErrorCommonStrings, localConstant } from "../utils/constant";

const prisma = new PrismaClient();

export const createPostService = async (
  authorId: number,
  content: string,
  title: string
) => {
  try {
    const post = await prisma.post.create({
      data: {
        authorId: authorId,
        content: content,
        title: title,
      },
    });
    return post;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
    } else if (error instanceof APIError) {
      throw error;
    }

    throw new APIError(
      ErrorCommonStrings.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_ERROR,
      false,
      localConstant.INTERNAL_SERVER_ERROR
    );
  }
};
