# Multi-Level Comment System API

This project implements a RESTful API for a social media platform that handles multi-level comments on posts. It allows users to create comments, reply to existing comments, and retrieve comments with pagination.

## BASE URL FOR THIS PROJECT

### The base URL for the API is:

```
http://comment.us-east-1.elasticbeanstalk.com
```

## Features

- User authentication (registration and login)
- Create post
- Create comments on posts
- Reply to existing comments
- Retrieve comments with pagination and sorting
- Rate limiting to prevent abuse

## Setup

1. Clone the repository:

   ```
   git clone https://github.com/your-username/multi-level-comment-system.git
   cd multi-level-comment-system
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env` and update the variables:
     ```
     cp .env.example .env
     ```
   - Update the `DATABASE_URL` and other variables in `.env`

4. Set up the database:

   ```
   npx prisma migrate dev
   ```

5. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- **Register a new user**

  - **URL:** `POST /api/register`
  - **Body:**

    ```json
    {
      "name": "string",
      "email": "string",
      "password": "string"
    }
    ```

  - **Success Response:**

    - **Code:** 201 CREATED
    - **Content:**

      ```json
      {
        "message": "User created successfully",
       "registerUser": {
        "id": 74,
        "email": "ritul15@gmail.com",
        "password": "$argon2id$v=19$m=65536,t=3,p=4$rOVB2oz2TWAWf/7Nhm2zlg$zIQxYbUX9KWSMHg14BO1rTAz6pvqIBFnbRR4PClFPLc",
        "name": "Ritul"
        }
      }
      ```

- **Login a user**

  - **URL:** `POST /api/login`
  - **Body:**

    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```

  - **Success Response:**

    - **Code:** 200 OK
    - **Content:**

      ```json
      {
        "message": "User logged in successfully",
        "loginUser": {
           "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NzQsImlhdCI6MTcyMzg2NjUyMywiZXhwIjoxNzIzOTUyOTIzfQ.pCajvINQ5wXLsogRZxGVGbi2nbdGICNyJXYQz1tV6MQ"
        }
      }
      ```

### Posts

- **Create a new post**

  - **URL:** `POST /api/post`
  - **Headers:**

    ```http
    Authorization: Bearer [token]
    ```

  - **Body:**

    ```json
    {
      "content": "string",
      "title": "string"
    }
    ```

  - **Success Response:**

    - **Code:** 201 CREATED
    - **Content:**

      ```json
      {
        "message": "Post created successfully",
        "post": {
         "id": 42,
        "title": "Nothing",
        "content": "there has to be some content",
        "authorId": 74
        }
      }
      ```

### Comments

- **Create a new comment on a post**

  - **URL:** `POST /api/posts/:postId/comments`
  - **Headers:**

    ```http
    Authorization: Bearer [token]
    ```

  - **Body:**

    ```json
    {
      "text": "string"
    }
    ```

  - **Success Response:**

    - **Code:** 201 CREATED
    - **Content:**

      ```json
      {
        "message": "Comment created successfully",
        "comment": {
          // comment details
        }
      }
      ```

- **Reply to an existing comment**

  - **URL:** `POST /api/posts/:postId/comments/:commentId/reply`
  - **Headers:**

    ```http
    Authorization: Bearer [token]
    ```

  - **Body:**

    ```json
    {
      "text": "string"
    }
    ```

  - **Success Response:**

    - **Code:** 201 CREATED
    - **Content:**

      ```json
      {
        "message": "Reply created successfully",
        "reply": {
          // reply details
        }
      }
      ```

- **Get comments for a post**

  - **URL:** `GET /api/posts/:postId/comments`
  - **Query Parameters:**

    - `sortBy`: string (optional)
    - `sortOrder`: "asc" | "desc" (optional)

  - **Success Response:**

    - **Code:** 200 OK
    - **Content:**

      ```json
      {
        "message": "Comments retrieved successfully",
        "comments": [
            {
            "id": 50,
            "text": "doing the comments",
            "createdAt": "2024-08-17T03:50:16.374Z",
            "postId": 42,
            "parentCommentId": null,
            "replies": [
                {
                    "id": 58,
                    "text": "doing the replies",
                    "createdAt": "2024-08-17T03:53:19.651Z"
                },
                {
                    "id": 57,
                    "text": "doing the replies",
                    "createdAt": "2024-08-17T03:53:17.980Z"
                }
            ],
            "totalReplies": 7
        },
        {
            "id": 51,
            "text": "doing the comments and more comments",
            "createdAt": "2024-08-17T03:50:30.663Z",
            "postId": 42,
            "parentCommentId": null,
            "replies": [],
            "totalReplies": 0
        }
        ]
      }
      ```

- **Expand parent-level comments**

  - **URL:** `GET /api/posts/:postId/comments/:commentId/expand`
  - **Query Parameters:**

    - `page`: number
    - `pageSize`: number

  - **Success Response:**

    - **Code:** 200 OK
    - **Content:**

      ```json
      {
        "message": "Comments expanded successfully",
        "comments": [
          {
            "id": 58,
            "text": "doing the replies",
            "createdAt": "2024-08-17T03:53:19.651Z",
            "postId": 42,
            "parentCommentId": 50,
            "replies": [],
            "totalReplies": 0
        },
        {
            "id": 57,
            "text": "doing the replies",
            "createdAt": "2024-08-17T03:53:17.980Z",
            "postId": 42,
            "parentCommentId": 50,
            "replies": [],
            "totalReplies": 0
        },
        {
            "id": 56,
            "text": "doing the replies",
            "createdAt": "2024-08-17T03:53:16.197Z",
            "postId": 42,
            "parentCommentId": 50,
            "replies": [],
            "totalReplies": 0
        }
        ],
         "total": 7,
         "page": 1,
         "pageSize": 3
      }
      ```

## Error Responses

All endpoints may return the following error responses:

- **Code:** 400 BAD REQUEST

  ```json
  {
    "message": "Error message describing the issue"
  }
  ```

- **Code:** 401 UNAUTHORIZED

  ```json
  {
    "message": "Authentication failed"
  }
  ```

- **Code:** 500 INTERNAL SERVER ERROR
  ```json
  {
    "message": "Internal server error message"
  }
  ```

## Testing

To run the tests:

```
npm test
```

For watching mode:

```
npm run test:watch
```

For test coverage:

```
npm run test:coverage
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Currently, users are limited to:

- 10 comments per 15-minute window

## Error Handling

The API uses custom error handling middleware. All errors are returned in a consistent format:

```json
{
  "message": "Error message",
  "httpCode": 400,
  "isOperational": true
}
```

## Architecture

The project follows a layered architecture:

1. **Controllers**: Handle HTTP requests and responses
2. **Services**: Contain business logic and interact with the database
3. **Models**: Define data structures and database schema (using Prisma)
4. **Middlewares**: Handle cross-cutting concerns like authentication and error handling

## Database

The project uses PostgreSQL with Neon, a serverless PostgreSQL service. Prisma ORM is used for database operations, providing type-safe database access.

## Authentication

JSON Web Tokens (JWT) are used for user authentication. Protected routes require a valid JWT in the Authorization header.
