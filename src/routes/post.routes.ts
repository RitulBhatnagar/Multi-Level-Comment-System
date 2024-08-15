import Router from "express";
import checkAuthToken from "../middlewares/authenticate";
import { createPost } from "../controllers/post.controller";

const router = Router();

router.post("/post", checkAuthToken, createPost);

export default router;
