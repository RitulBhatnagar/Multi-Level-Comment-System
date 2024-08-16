import request from "supertest";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import app from "../../src/index";

const prisma = new PrismaClient();

let authToken: string;
let userId: number;
let postId: number;
let commentId: number;

// Helper functions
const createUser = async (email: string, password: string, name: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    return await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      // If user already exists, fetch and return the existing user
      return await prisma.user.findUnique({ where: { email } });
    }
    throw error;
  }
};

const loginUser = async (email: string, password: string) => {
  const res = await request(app)
    .post("/api/user/login")
    .send({ email, password });
  expect(res.statusCode).toBe(200);
  return res.body.loginUser;
};

const createPost = async (token: string, title: string, content: string) => {
  const res = await request(app)
    .post("/api/post")
    .set("Authorization", `Bearer ${token}`)
    .send({ title, content });
  expect(res.statusCode).toBe(201);
  return res.body.post.id;
};

const createComment = async (token: string, postId: number, text: string) => {
  const res = await request(app)
    .post(`/api/posts/${postId}/comments`)
    .set("Authorization", `Bearer ${token}`)
    .send({ text });
  expect(res.statusCode).toBe(201);
  return res.body.comment.id;
};

beforeAll(async () => {
  try {
    // Clean up existing test data
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany({ where: { email: "test@example.com" } });

    const user = await createUser(
      "test@example.com",
      "hashedpassword",
      "Test User"
    );
    userId = user!.id;
    authToken = await loginUser("test@example.com", "hashedpassword");
    postId = await createPost(authToken, "Test Post", "This is a test post");
    commentId = await createComment(authToken, postId, "Test comment");
  } catch (error) {
    console.error("Setup failed:", error);
    throw error;
  }
});

afterAll(async () => {
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

// USER AUTHENTICATION TESTS

describe("User Authentication", () => {
  test("POST /api/user/register - Register a new user", async () => {
    const res = await request(app).post("/api/user/register").send({
      email: "newuser@example.com",
      password: "password123",
      name: "New User",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      message: "User created successfully",
      registerUser: {
        id: expect.any(Number),
        email: "newuser@example.com",
        name: "New User",
        password: expect.stringMatching(/^\$2b\$10\$/),
      },
    });
  });

  test("POST /api/user/register - Try to Register with same email", async () => {
    const res = await request(app).post("/api/user/register").send({
      email: "newuser@example.com",
      password: "password123",
      name: "New User",
    });
    expect(res.statusCode).toBe(405);
    expect(res.body).toMatchObject({
      message: "USER ALREADY EXISIT",
    });
  });

  test("POST /api/user/login - Login user", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: "newuser@example.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      message: "User logged in successfully",
      loginUser: expect.any(String),
    });
  });

  test("POST /api/user/login - Login with incorrect email", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: "newus@example.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({
      message: "USER NOT FOUND",
    });
  });

  test("POST /api/user/login - Login with incorrect password", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: "newuser@example.com",
      password: "wrongpassword",
    });
    expect(res.statusCode).toBe(401);
  });
});

// POST OPERATIONS

describe("Post Operations", () => {
  test("POST /api/post - Create a new post", async () => {
    const res = await request(app)
      .post("/api/post")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "New Post",
        content: "This is a new post content",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      message: "Post created successfully",
      post: {
        id: expect.any(Number),
        title: "New Post",
        content: "This is a new post content",
        authorId: userId,
      },
    });
  });

  test("POST /api/post - Attempt to create post with wrong  authentication token", async () => {
    const res = await request(app)
      .post("/api/post")
      .set("Authorization", `Bearer token`)
      .send({
        title: "New Post",
        content: "This is a new post content",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body).toMatchObject({
      message: "Unauthorized: Invalid authorization token",
    });
  });

  test("POST /api/post - Attempt to create post without auth", async () => {
    const res = await request(app).post("/api/post").send({
      title: "Unauthorized Post",
      content: "This should fail",
    });
    expect(res.statusCode).toBe(403);
    expect(res.body).toMatchObject({
      message: "Unauthorized: Missing authorization token",
    });
  });
});

// Comment Operations

describe("Comment Operations", () => {
  test("POST /api/posts/:postId/comments - Create a comment", async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ text: "New comment" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      message: "Comment created successfully",
      comment: {
        id: expect.any(Number),
        text: "New comment",
        createdAt: expect.any(String),
        postId: postId,
        authorId: userId,
        parentCommentId: null,
      },
    });
  });

  test("POST /api/posts/:postId/comments - if post id is invalid", async () => {
    const res = await request(app)
      .post(`/api/posts/0/comments`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ text: "New comment" });
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({
      message: "POST NOT FOUND",
    });
  });
  test("POST /api/posts/:postId/comments/:commentId/reply - Create a reply", async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments/${commentId}/reply`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ text: "Reply to comment" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      message: "Reply created successfully",
      reply: {
        id: expect.any(Number),
        text: "Reply to comment",
        createdAt: expect.any(String),
        postId: postId,
        authorId: userId,
        parentCommentId: commentId,
      },
    });
  });

  test("POST /api/posts/:postId/comments/:commentId/reply - Incorrect post id", async () => {
    const res = await request(app)
      .post(`/api/posts/0/comments/${commentId}/reply`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ text: "Reply to comment" });
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({
      message: "POST NOT FOUND",
    });
  });

  test("POST /api/posts/:postId/comments/:commentId/reply - if comment is invalid", async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments/0/reply`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ text: "Reply to comment" });
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({
      message: "COMMENT NOT FOUND",
    });
  });

  test("GET /api/posts/:postId/comments - Retrieve comments for a post", async () => {
    const res = await request(app).get(`/api/posts/${postId}/comments`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      message: "Comments retrieved successfully",
      comments: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          text: expect.any(String),
          createdAt: expect.any(String),
          postId: postId,
          parentCommentId: null,
          replies: expect.any(Array),
          totalReplies: expect.any(Number),
        }),
      ]),
    });
  });

  test("GET /api/posts/:postId/comments - Incorrect post id", async () => {
    const res = await request(app).get(`/api/posts/0/comments`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({
      message: "POST NOT FOUND",
    });
  });

  test("GET /api/posts/:postId/comments/:commentId/expand - Retrieve expanded comments", async () => {
    const res = await request(app).get(
      `/api/posts/${postId}/comments/${commentId}/expand?page=1&pageSize=2`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      message: "Comments expanded successfully",
      comments: expect.any(Array),
      total: expect.any(Number),
      page: 1,
      pageSize: 2,
    });
    res.body.comments.forEach((comment: any) => {
      expect(comment).toMatchObject({
        id: expect.any(Number),
        text: expect.any(String),
        createdAt: expect.any(String),
        postId: postId,
        parentCommentId: commentId,
        replies: expect.any(Array),
        totalReplies: expect.any(Number),
      });
    });
  });
  test("GET /api/posts/:postId/comments/:commentId/expand - Incorrect post id", async () => {
    const res = await request(app).get(
      `/api/posts/0/comments/${commentId}/expand?page=1&pageSize=2`
    );
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({
      message: "POST NOT FOUND",
    });
  });
  test("GET /api/posts/:postId/comments/:commentId/expand - Incorrect comment id", async () => {
    const res = await request(app).get(
      `/api/posts/${postId}/comments/0/expand?page=1&pageSize=2`
    );
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({
      message: "COMMENT NOT FOUND",
    });
  });
});
