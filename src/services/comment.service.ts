import { PrismaClient, Comment, Prisma } from "@prisma/client";
import logger from "../utils/logger";
import APIError, { HttpStatusCode } from "../middlewares/errorMiddleware";
import { ErrorCommonStrings, localConstant } from "../utils/constant";

const prisma = new PrismaClient();

export const createCommentService = async (
  postId: number,
  comment: string,
  authorId: number
) => {
  try {
    const createComment = await prisma.comment.create({
      data: {
        text: comment,
        postId: postId,
        authorId: authorId,
      },
    });
    return createComment;
  } catch (error) {
    logger.error("Error while creating comment", error);
    throw new APIError(
      ErrorCommonStrings.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_ERROR,
      false,
      localConstant.INTERNAL_SERVER_ERROR
    );
  }
};

export const replyToCommentService = async (
  commentId: number,
  reply: string,
  authorId: number,
  postId: number
) => {
  try {
    const createReply = await prisma.comment.create({
      data: {
        text: reply,
        postId: postId,
        authorId: authorId,
        parentCommentId: commentId,
      },
    });
    return createReply;
  } catch (error) {
    logger.error("Error while creating reply", error);
    throw new APIError(
      ErrorCommonStrings.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_ERROR,
      false,
      localConstant.INTERNAL_SERVER_ERROR
    );
  }
};

export const getCommentsForPostService = async (
  postId: number,
  sortBy: string,
  sortOrder: string
) => {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId: postId,
        parentCommentId: null,
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
        postId: true,
        parentCommentId: true,
        replies: {
          select: {
            id: true,
            text: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 2,
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
    return comments.map((comment) => ({
      ...comment,
      totalReplies: comment._count.replies,
      _count: undefined,
    }));
  } catch (error) {
    logger.error("Error while getting comments", error);
    throw new APIError(
      ErrorCommonStrings.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_ERROR,
      false,
      localConstant.INTERNAL_SERVER_ERROR
    );
  }
};

// Expand Parent-Level Comments API with Pagination:

export const expandParentLevelCommentsService = async (
  postId: number,
  commentId: number,
  page: number,
  pageSize: number
) => {
  try {
    const [total, comments] = await prisma.$transaction([
      prisma.comment.count({
        where: {
          postId: postId,
          parentCommentId: commentId,
        },
      }),
      prisma.comment.findMany({
        where: {
          postId: postId,
          parentCommentId: commentId,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          text: true,
          createdAt: true,
          postId: true,
          parentCommentId: true,
          replies: {
            select: {
              id: true,
              text: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 2,
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);
    return {
      comments: comments.map((comment) => ({
        ...comment,
        totalReplies: comment._count.replies,
        _count: undefined,
      })),
      total,
    };
  } catch (error) {
    logger.error("Error expanding parent-level comments:", error);
    throw new APIError(
      ErrorCommonStrings.INTERNAL_SERVER_ERROR,
      HttpStatusCode.INTERNAL_ERROR,
      false,
      localConstant.INTERNAL_SERVER_ERROR
    );
  }
};
