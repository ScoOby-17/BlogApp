# Blog App Backend

The backend is an Express and MongoDB REST API for the MERN Blog App. It handles user and administrator authentication, post and comment management, image uploads, authorization, validation, and API responses.

## Technology

- Node.js and Express
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- HTTP-only cookies with `cookie-parser`
- Multer for cover-image uploads
- Joi for request validation
- bcrypt for password hashing

## Folder structure

```text
backend/
├── config/
│   └── db.js                    # MongoDB connection helper
├── controllers/                 # Request/business logic
│   ├── admin.controller.js
│   ├── auth.controller.js
│   ├── comment.controller.js
│   ├── post.controller.js
│   └── user.controller.js
├── middlewares/                 # Reusable request middleware
│   ├── admin.middleware.js      # Requires the admin role
│   ├── auth.middleware.js       # Verifies the access-token cookie
│   ├── error.middleware.js      # Formats unexpected errors
│   ├── upload.middleware.js     # Configures Multer
│   └── validate.middleware.js   # Runs Joi schemas
├── models/                      # Mongoose data models
│   ├── Comment.js
│   ├── Post.js
│   └── User.js
├── routes/                      # Express route definitions
│   ├── admin.routes.js
│   ├── auth.routes.js
│   ├── comment.routes.js
│   ├── post.routes.js
│   └── user.routes.js
├── seed/
│   └── adminSeed.js             # Default-admin setup script
├── uploads/                     # Uploaded cover images (created/used at runtime)
├── utils/
│   ├── apiResponse.js           # Consistent success/error response helpers
│   └── generateTokens.js        # JWT creation helpers
├── validations/                 # Joi input schemas
├── .env                         # Local environment configuration (do not commit secrets)
├── package.json
└── server.js                    # Application entry point
```

## Authentication

Authentication uses two JWTs stored as HTTP-only cookies, which prevents frontend JavaScript from reading them directly.

1. A user registers or signs in.
2. The API verifies credentials and creates:
   - an **access token** that expires after **15 minutes**;
   - a **refresh token** that expires after **7 days**.
3. The API stores both in `httpOnly`, `sameSite: 'strict'` cookies. Cookies use `secure: true` in production.
4. Protected endpoints run `auth.middleware.js`, which verifies the access token and adds the database user to `req.user`.
5. When an access token expires, the frontend Axios interceptor calls `POST /api/auth/refresh`. A valid refresh token causes the API to set a new access-token cookie and retry the original request.
6. Administrator endpoints also run `admin.middleware.js`, which checks `req.user.role === 'admin'`.
7. Logging out clears both authentication cookies.

Passwords are hashed with bcrypt in the `User` model's pre-save hook. Password hashes are removed from JSON responses.

## Image uploads

Posts require a cover image on creation. The post routes use `upload.single('coverImage')`, provided by Multer.

- Images are saved in `uploads/`.
- Supported types: JPEG, JPG, PNG, GIF, and WebP.
- Maximum size: 5 MB.
- Each saved file receives a unique `blog-<timestamp>-<random>.<extension>` filename.
- Files are publicly served as `/uploads/<filename>`.
- Replacing or deleting a post attempts to remove its previous cover image.

Send post creation and update requests as `multipart/form-data` and use `coverImage` as the file field name.

## API routes

All API responses use this general shape:

```json
{
  "success": true,
  "message": "Posts fetched successfully",
  "data": {}
}
```

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Confirms that the server is running. |
| `POST` | `/api/auth/register` | Public | Registers a standard user and sets auth cookies. |
| `POST` | `/api/auth/login` | Public | Logs in a standard user with email and password. |
| `POST` | `/api/auth/logout` | Public | Clears authentication cookies. |
| `POST` | `/api/auth/refresh` | Refresh cookie | Issues a new access-token cookie. |
| `GET` | `/api/posts` | Public | Lists paginated posts. Supports `page`, `limit`, and `category` query parameters. |
| `GET` | `/api/posts/:id` | Public | Gets one post with author and comments. |
| `POST` | `/api/posts` | Signed in | Creates a post. Requires a `coverImage` upload. |
| `PUT` | `/api/posts/:id` | Author or admin | Updates a post. A new `coverImage` is optional. |
| `DELETE` | `/api/posts/:id` | Author or admin | Deletes a post, its comments, and its image. |
| `POST` | `/api/posts/:id/like` | Signed in | Toggles the current user's like. |
| `POST` | `/api/posts/:id/comments` | Signed in | Creates a comment for a post. |
| `DELETE` | `/api/comments/:id` | Comment author or admin | Deletes a comment. |
| `GET` | `/api/users/me` | Signed in | Gets the current user's profile. |
| `GET` | `/api/users/me/posts` | Signed in | Gets all posts written by the current user. |
| `POST` | `/api/admin/login` | Public | Logs in an administrator with admin ID and password. |
| `GET` | `/api/admin/users` | Administrator | Gets standard user accounts. |
| `DELETE` | `/api/admin/users/:id` | Administrator | Deletes a standard user and their posts, comments, and images. |
| `GET` | `/api/admin/posts` | Administrator | Gets all posts for the dashboard. |

## Setup

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally, or a MongoDB connection URI

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create or update `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/BlogApp
JWT_ACCESS_SECRET=replace_with_a_long_random_access_secret
JWT_REFRESH_SECRET=replace_with_a_long_random_refresh_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Use strong, unique secrets outside local development. The frontend URL must match the URL used by your Vite application so cookie-based CORS requests are allowed.

### 3. Seed the default administrator

```bash
npm run seed:admin
```

The script creates the default administrator if needed. If an account with the same admin ID already exists, it restores the documented default account details.

### 4. Start the API

For development with automatic restarts:

```bash
npm run dev
```

For a normal Node process:

```bash
npm start
```

The API starts at `http://localhost:5000`, and the health check is available at `http://localhost:5000/api/health`.

## Default administrator credentials

> These credentials are for local development. Change the password and replace the seed values before deploying a real application.

| Field | Value |
| --- | --- |
| Admin ID | `admin001` |
| Password | `Admin@123` |
| Email | `admin@blog.com` |

## Available npm scripts

| Script | Purpose |
| --- | --- |
| `npm start` | Starts the API with Node.js. |
| `npm run dev` | Starts the API with Nodemon. |
| `npm run seed:admin` | Creates or restores the default administrator account. |
