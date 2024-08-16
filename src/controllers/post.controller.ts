import { Request, Response } from "express";
import logger from "../utils/logger";
import APIError, { HttpStatusCode } from "../middlewares/errorMiddleware";
import { localConstant } from "../utils/constant";
import { createPostService } from "../services/post.service";

export const createPost = async (req: Request, res: Response) => {
  const { content, title } = req.body;
  const { userId: authorId } = req.body.user;
  console.log(authorId);
  try {
    const post = await createPostService(authorId, content, title);
    return res.status(HttpStatusCode.CREATED).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    logger.error("Error while creating post", error);
    if (error instanceof APIError) {
      return res
        .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          message: error.message || localConstant.POST_NOT_CREATED,
        });
    }
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: localConstant.POST_NOT_CREATED,
    });
  }
};
