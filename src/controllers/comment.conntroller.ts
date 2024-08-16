import { Request, Response } from "express";
import {
  createCommentService,
  replyToCommentService,
  getCommentsForPostService,
  expandParentLevelCommentsService,
} from "../services/comment.service";
import logger from "../utils/logger";
import APIError, { HttpStatusCode } from "../middlewares/errorMiddleware";
import { localConstant } from "../utils/constant";

/**
 * Controller function to handle creating a new comment.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} The response object containing the created comment.
 */
export const createComment = async (req: Request, res: Response) => {
  const { text } = req.body;
  const { postId } = req.params;
  const { userId: authorId } = req.body.user; // Assuming user ID is attached to request by auth middleware

  try {
    const comment = await createCommentService(
      parseInt(postId as string),
      text,
      authorId
    );
    return res.status(HttpStatusCode.CREATED).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    logger.error("Error in creating comment", error);
    if (error instanceof APIError) {
      return res
        .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          message: error.message || localConstant.COMMENT_NOT_CREATED,
        });
    }
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: localConstant.COMMENT_NOT_CREATED,
    });
  }
};

/**
 * Controller function to handle replying to an existing comment.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} The response object containing the created reply.
 */
export const replyToComment = async (req: Request, res: Response) => {
  const { text } = req.body;
  const { userId: authorId } = req.body.user; // Assuming user ID is attached to request by auth middleware
  const { postId, commentId } = req.params;
  try {
    const reply = await replyToCommentService(
      parseInt(commentId as string),
      text,
      authorId,
      parseInt(postId as string)
    );
    return res.status(HttpStatusCode.CREATED).json({
      message: "Reply created successfully",
      reply,
    });
  } catch (error) {
    logger.error("Error in replying to comment", error);
    if (error instanceof APIError) {
      return res
        .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          message: error.message || localConstant.REPLY_NOT_CREATED,
        });
    }
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: localConstant.REPLY_NOT_CREATED,
    });
  }
};

/**
 * Controller function to handle getting comments for a post.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} The response object containing the comments.
 */
export const getCommentsForPost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { sortBy, sortOrder } = req.query;

  try {
    const comments = await getCommentsForPostService(
      parseInt(postId),
      sortBy as string,
      sortOrder as "asc" | "desc"
    );
    return res.status(HttpStatusCode.OK).json({
      message: "Comments retrieved successfully",
      comments,
    });
  } catch (error) {
    logger.error("Error in getting comments for post", error);
    if (error instanceof APIError) {
      return res
        .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          message: error.message || localConstant.COMMENTS_NOT_RETRIEVED,
        });
    }
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: localConstant.COMMENTS_NOT_RETRIEVED,
    });
  }
};

/**
 * Controller function to handle expanding parent-level comments.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} The response object containing the expanded comments.
 */
export const expandParentLevelComments = async (
  req: Request,
  res: Response
) => {
  const { postId, commentId } = req.params;
  const { page, pageSize } = req.query;

  try {
    const { comments, total } = await expandParentLevelCommentsService(
      parseInt(postId),
      parseInt(commentId),
      parseInt(page as string),
      parseInt(pageSize as string)
    );
    return res.status(HttpStatusCode.OK).json({
      message: "Comments expanded successfully",
      comments,
      total,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
    });
  } catch (error) {
    logger.error("Error in expanding parent-level comments", error);
    if (error instanceof APIError) {
      return res
        .status(error.httpCode || HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({
          message: error.message || localConstant.COMMENTS_NOT_EXPANDED,
        });
    }
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: localConstant.COMMENTS_NOT_EXPANDED,
    });
  }
};
