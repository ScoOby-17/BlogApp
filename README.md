# MERN Blog Application

A full-stack blog application built with the MERN stack (MongoDB, Express, React, Node.js) featuring a modern dark theme UI, JWT authentication, rich text editing, and admin panel.

## Features

### User Features
-  User registration and login with JWT authentication (access + refresh tokens)
-  Create, read, update, delete blog posts (own posts only)
- ️ Upload cover images for blog posts
- ️ Rich text editor for blog content (React Quill)
-  Comment on posts (multiple comments per user)
- ️ Like/unlike posts
-  Filter posts by category (tech, food, place, other)
-  Pagination for post listings
-  User profile with own posts management

### Admin Features
-  Separate admin login with admin ID
-  View and delete users
-  View and delete all posts
- ️ Delete any comment

### Technical Features
-  Modern dark theme with CSS variables
-  Fully responsive design
-  httpOnly cookies for secure token storage
-  Input validation with Joi
-  Password hashing with bcrypt
-  File uploads with Multer
-  No CSS frameworks (plain CSS only)
-  Automatic token refresh
-  Protected routes on frontend and backend

## Tech Stack

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- JWT (jsonwebtoken)
- bcrypt
- Joi (validation)
- Multer (file uploads)
- cookie-parser
- cors

### Frontend
- React 18
- Vite
- React Router DOM
- React Quill (rich text editor)
- React Toastify (notifications)
- Axios
- Plain CSS with CSS variables

## Project Structure

```
blog-app/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── Comment.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── post.controller.js
│   │   ├── comment.controller.js
│   │   ├── user.controller.js
│   │   └── admin.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── post.routes.js
│   │   ├── comment.routes.js
│   │   ├── user.routes.js
│   │   └── admin.routes.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── admin.middleware.js
│   │   ├── upload.middleware.js
│   │   ├── validate.middleware.js
│   │   └── error.middleware.js
│   ├── validations/
│   │   ├── auth.validation.js
│   │   ├── post.validation.js
│   │   └── comment.validation.js
│   ├── utils/
│   │   ├── generateTokens.js
│   │   └── apiResponse.js
│   ├── uploads/
│   ├── server.js
│   ├── seed.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── .env
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or connection URI)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
cd C:\CodeS\BlogApp
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

#### Backend (.env)

Create `backend/.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/blogapp
JWT_ACCESS_SECRET=your_access_token_secret_change_this_in_production
JWT_REFRESH_SECRET=your_refresh_token_secret_change_this_in_production
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

️ **Important:** Change the JWT secrets to strong random strings in production!

#### Frontend (.env)

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000
```

### 5. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongodb
# or
sudo service mongodb start
```

### 6. Seed Admin User (First Time Only)

```bash
cd backend
node seed.js
```

This creates an admin user with:
- **Admin ID:** `admin001`
- **Password:** `admin123`

️ **Change the admin password after first login!**

## Running the Application

### Development Mode

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

## Usage

### Regular User Flow

1. Visit http://localhost:5173
2. Click **Register** to create an account
3. Fill in name, email, and password
4. After registration, you'll be automatically logged in
5. Click **Create Post** to write a blog post
6. Upload a cover image, add title, select category, and write content
7. View posts on the home page, filter by category
8. Click a post to read, like, and comment
9. Visit **Profile** to see and manage your posts

### Admin Flow

1. Visit http://localhost:5173/admin/login
2. Login with:
   - Admin ID: `admin001`
   - Password: `admin123`
3. Access the Admin Dashboard to:
   - View and delete users
   - View and delete all posts
   - Manage the entire system

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### Posts
- `GET /api/posts` - Get all posts (with pagination & filtering)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post (auth required)
- `PUT /api/posts/:id` - Update post (auth required, owner or admin)
- `DELETE /api/posts/:id` - Delete post (auth required, owner or admin)
- `POST /api/posts/:id/like` - Toggle like (auth required)

### Comments
- `POST /api/posts/:id/comments` - Create comment (auth required)
- `DELETE /api/comments/:id` - Delete comment (auth required, owner or admin)

### User
- `GET /api/users/me` - Get current user profile (auth required)
- `GET /api/users/me/posts` - Get current user's posts (auth required)

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/users` - Get all users (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)
- `GET /api/admin/posts` - Get all posts (admin only)

## Design Features

### Dark Theme
- Primary background: `#0f0f0f`
- Secondary background: `#1a1a1a`
- Accent color: `#6366f1` (indigo)
- Clean, modern card-based layout
- Subtle hover effects and transitions
- CSS variables for easy theming

### Responsive Design
- Mobile-first approach
- Hamburger menu on mobile
- Grid layouts that adapt to screen size
- Touch-friendly interface

## Security Features

- Password hashing with bcrypt
- JWT tokens stored in httpOnly cookies
- Access token (15 min expiry) + Refresh token (7 day expiry)
- Input validation on backend and frontend
- Protected routes and middleware
- CORS configuration
- File upload validation (images only, max 5MB)

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in `backend/.env`
- Verify database name is correct

### Port Already in Use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `frontend/vite.config.js`

### CORS Errors
- Verify `CLIENT_URL` in `backend/.env` matches frontend URL
- Check frontend `.env` has correct `VITE_API_URL`

### Image Upload Issues
- Verify `backend/uploads` directory exists
- Check file size is under 5MB
- Ensure file type is an image (jpeg, jpg, png, gif, webp)

### Token Expiration
- Refresh tokens automatically handled by axios interceptor
- If refresh token expires (7 days), user must login again

## Future Enhancements

- [ ] Search functionality
- [ ] User avatars upload
- [ ] Post tags/multi-category support
- [ ] Email verification
- [ ] Password reset
- [ ] Social media sharing
- [ ] Post drafts
- [ ] Comment replies (nested comments)
- [ ] User roles (moderator, contributor)
- [ ] Analytics dashboard

## License

MIT

## Author

Built with ️ using the MERN stack