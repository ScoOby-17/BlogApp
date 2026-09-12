# Blog App Frontend

The frontend is a Vite-powered React application for the MERN Blog App. It provides a responsive dark interface for browsing posts, managing an account, writing rich-text posts, commenting, liking content, and administering the app.

## Technology

- React 18
- Vite
- React Router
- Axios
- React Quill rich-text editor
- React Toastify notifications
- Plain CSS and CSS custom properties (no Tailwind CSS or Bootstrap)

## Folder structure

```text
frontend/
├── src/
│   ├── components/              # Reusable UI and route-guard components
│   │   ├── AdminRoute.jsx
│   │   ├── CategoryFilter.jsx
│   │   ├── CommentItem.jsx
│   │   ├── CommentSection.jsx
│   │   ├── Footer.jsx
│   │   ├── Loader.jsx
│   │   ├── Navbar.jsx
│   │   ├── Pagination.jsx
│   │   ├── PostCard.jsx
│   │   ├── PostList.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── RichTextEditor.jsx
│   ├── context/
│   │   ├── AuthContext.jsx      # Signed-in user state and auth actions
│   │   └── ConfigContext.jsx    # API base URL configuration
│   ├── pages/                   # Route-level page components
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── BlogDetail.jsx
│   │   ├── CreateBlog.jsx
│   │   ├── EditBlog.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── NotFound.jsx
│   │   ├── Profile.jsx
│   │   └── Register.jsx
│   ├── services/                # Axios API wrappers
│   │   ├── adminService.js
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── commentService.js
│   │   ├── postService.js
│   │   └── userService.js
│   ├── styles/                  # Global, page, and component CSS
│   ├── App.jsx                  # Application routes and layout
│   └── main.jsx                 # React entry point and providers
├── .env                         # Vite environment variables
├── package.json
└── vite.config.js
```

## API communication

### `VITE_API_URL` and `ConfigContext`

The application uses `VITE_API_URL` to determine the backend origin. Set it in `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

`ConfigContext` reads that value through Vite's `import.meta.env.VITE_API_URL` and exposes `API_BASE_URL` to components through the `useConfig()` hook. If no environment value exists, it falls back to `http://localhost:5000`.

The shared Axios client in `src/services/api.js` uses the same value and sets its base URL to `${API_BASE_URL}/api`. All requests use `withCredentials: true`, so the browser includes the backend's HTTP-only authentication cookies. Image URLs use the backend origin with `/uploads/<filename>`.

> Restart the Vite dev server whenever `.env` changes. Only variables prefixed with `VITE_` are available in browser code.

### API service modules

Feature-specific services keep page components focused on UI work:

- `authService.js` handles registration, login, logout, and refresh.
- `postService.js` handles post browsing, CRUD operations, and likes.
- `commentService.js` handles comment creation and deletion.
- `userService.js` gets the current user and their posts.
- `adminService.js` handles administrator login and dashboard data.

The Axios response interceptor handles `401 Unauthorized` responses once per request. It calls `/api/auth/refresh` and retries the original request when the refresh succeeds. If it fails, the browser returns to `/login`.

## Authentication state

`AuthContext` is the app-wide source of truth for the signed-in user.

- It stores `user` and `loading` state.
- On application startup, it calls `GET /api/users/me` through `checkAuth()` to restore a session from HTTP-only cookies.
- `login(userData)` updates the user state after a successful user or admin login.
- `logout()` calls the backend logout endpoint and clears the local `user` state.
- `refreshToken()` calls the refresh endpoint and reports whether it succeeded.
- `ProtectedRoute` prevents unauthenticated visitors from opening user-only pages.
- `AdminRoute` additionally requires the current user to have the `admin` role.

`main.jsx` nests `AuthProvider` inside `ConfigProvider`, allowing the auth context to access `API_BASE_URL`.

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Home page with post listing, categories, and pagination. |
| `/login` | Public | Standard user sign-in. |
| `/register` | Public | User registration. |
| `/posts/:id` | Public | Individual blog post and comments. |
| `/profile` | Signed in | Current user's profile and posts. |
| `/create` | Signed in | Create a blog post with a rich-text editor. |
| `/edit/:id` | Signed in | Edit a post owned by the user or permitted by the API. |
| `/admin/login` | Public | Administrator sign-in. |
| `/admin/dashboard` | Administrator | User and post management dashboard. |
| `*` | Public | Not-found page. |

## Setup

### Prerequisites

- Node.js 18 or newer
- npm
- The backend API running (normally on port 5000)

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure the backend URL

Create or update `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

For local development, this value must correspond to the backend server and the backend's `CLIENT_URL` should be `http://localhost:5173`.

### 3. Start the development server

```bash
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`.

### 4. Build for production

```bash
npm run build
```

To inspect the production build locally:

```bash
npm run preview
```

## Available npm scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Creates an optimized production build. |
| `npm run preview` | Serves the existing production build locally. |

## Backend startup reminder

Before signing in as an administrator, run the backend seed command from the `backend` directory:

```bash
npm run seed:admin
```

The local default admin ID is `admin001` and the password is `Admin@123`.
