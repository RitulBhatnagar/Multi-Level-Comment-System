# Multi-Level Comment System API

This project implements a RESTful API for a social media platform that handles multi-level comments on posts. It allows users to create comments, reply to existing comments, and retrieve comments with pagination.

## Features

- User authentication (registration and login)
- Create and manage posts
- Create comments on posts
- Reply to existing comments
- Retrieve comments with pagination and sorting
- Rate limiting to prevent abuse

## Technologies Used

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL (Neon Database)
- JSON Web Tokens (JWT) for authentication
- Jest for testing

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- PostgreSQL database (local or cloud-based like Neon)

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

- `POST /api/register`: Register a new user
- `POST /api/login`: Login a user

### Posts

- `POST /api/posts`: Create a new post
- `GET /api/posts`: Get all posts
- `GET /api/posts/:postId`: Get a specific post

### Comments

- `POST /api/posts/:postId/comments`: Create a new comment on a post
- `POST /api/posts/:postId/comments/:commentId/reply`: Reply to an existing comment
- `GET /api/posts/:postId/comments`: Get comments for a post
- `GET /api/posts/:postId/comments/:commentId/expand`: Expand parent-level comments

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
