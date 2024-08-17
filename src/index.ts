import express from "express";
import dotenv from "dotenv";
import logger from "./utils/logger";
dotenv.config();
import userRoute from "./routes/user.routes";
import commentRoutes from "./routes/comment.routes";
import postRoutes from "./routes/post.routes";
import healthRoute from "./routes/health.routes";
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// health check
app.use("/", healthRoute);
// user route
app.use("/api", userRoute);
// comment route
app.use("/api", commentRoutes);
// post route
app.use("/api", postRoutes);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

export default app;
