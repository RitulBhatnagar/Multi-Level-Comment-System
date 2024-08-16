import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user..controller";

const router = Router();

router.post("/user/register", registerUser);
router.post("/user/login", loginUser);

export default router;
