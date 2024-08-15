import { Router } from "express";
import {
  createComment,
  expandParentLevelComments,
  getCommentsForPost,
  replyToComment,
} from "../controllers/comment.conntroller";
import checkAuthToken from "../middlewares/authenticate";
import { commentRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.post(
  "/posts/:postId/comments",
  checkAuthToken,
  commentRateLimiter,
  createComment
);

router.post(
  "/posts/:postId/comments/:commentId/reply",
  checkAuthToken,
  commentRateLimiter,
  replyToComment
);

router.get("/posts/:postId/comments", getCommentsForPost);

router.get(
  "/posts/:postId/comments/:commentId/expand",
  expandParentLevelComments
);

export default router;
