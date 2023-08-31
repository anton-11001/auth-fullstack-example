# auth-fullstack-example

Full-stack authentication example with an Express/MongoDB backend and a frontend client.

## Backend Implementation

The backend lives in `back-end/` and is implemented with Node.js, Express, MongoDB, Mongoose, JWT authentication, refresh-token cookies, and email verification.

### Main Responsibilities

The backend handles:

- User registration with password hashing.
- Login with password validation.
- JWT access-token creation.
- Refresh-token creation, storage, cookie delivery, and rotation.
- Logout by removing the stored refresh token and clearing the cookie.
- Email verification through a unique verification link.
- Protected user routes.
- Request validation and centralized error handling.

### Project Structure

```text
back-end/
  index.js                         Express app entrypoint
  routes/index.js                  API route definitions
  controllers/                     Route handlers
  db/                              Database connection and query helpers
  middlewares/                     Auth, validation, and error middleware
  models/                          Mongoose schemas
  services/                        Token, email, and error helper services
  validation/                      express-validator rules
  html/verify-email-message.html   Email verification template
```

### Server Startup

`back-end/index.js` is the application entrypoint.

It loads environment variables with `dotenv`, creates an Express app, and registers global middleware:

- `express.json()` parses incoming JSON request bodies.
- `cookie-parser` reads cookies from requests.
- `cors` allows requests from `CLIENT_URL` and enables credentials so the browser can send and receive cookies.
- `/api` mounts the main API router.
- A 404 handler returns `Endpoint not found` for unknown routes.
- `errorMiddleware` handles thrown errors from controllers and middleware.

The server starts only after `connectToDb()` successfully connects to MongoDB using `DB_URL`.

### Environment Variables

The backend expects these variables in `back-end/.env`:

```env
PORT=5000
DB_URL=mongodb_connection_string
JWT_ACCESS_SECRET=access_token_secret
JWT_REFRESH_SECRET=refresh_token_secret
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=smtp_user
SMTP_PASSWORD=smtp_password
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
APP_NAME=Auth Fullstack Example
```

`API_URL` is used to build email verification links. `CLIENT_URL` is used for CORS and for redirecting users after successful email verification.

### Database Layer

MongoDB access is handled through Mongoose.

`db/connect.js` connects to the database:

```js
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
```

The backend uses small database helper modules instead of querying models directly from every controller. For example:

- `db/user/createUser.js` creates a user.
- `db/user/findUser.js` finds a user by email.
- `db/user/findUserById.js` finds a user by MongoDB id.
- `db/tokens/saveToken.js` creates or updates a user's refresh token.
- `db/tokens/findToken.js` finds a refresh token in the database.
- `db/tokens/deleteToken.js` removes a refresh token during logout.

### Data Models

#### User Model

`models/user.js` defines the user schema:

```js
{
  name: String,
  email: String,
  password: String,
  isEmailVerified: Boolean,
  emailVerificationId: String
}
```

Important details:

- `name`, `email`, and `password` are required.
- `email` is unique.
- `password` stores a bcrypt hash, not the raw password.
- `isEmailVerified` defaults to `false`.
- `emailVerificationId` stores the UUID used in the verification URL.

#### Token Model

`models/token.js` stores refresh tokens:

```js
{
  user: ObjectId,
  refreshToken: String
}
```

Each token document links a refresh token to a user. `saveToken()` updates the existing token for a user if one already exists, so the active refresh token is rotated on login and refresh.

### Routes

All backend routes are mounted under `/api`.

| Method | Route                                    | Protected | Description                                                                      |
| ------ | ---------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `POST` | `/api/register`                          | No        | Creates a user, sends verification email, returns access token and user payload. |
| `POST` | `/api/login`                             | No        | Validates credentials, returns access token and user payload.                    |
| `POST` | `/api/logout`                            | Yes       | Deletes the current refresh token and clears the refresh-token cookie.           |
| `GET`  | `/api/verify-email/:emailVerificationId` | No        | Marks the matching user email as verified and redirects to the client.           |
| `GET`  | `/api/refresh`                           | No        | Validates the refresh-token cookie and issues a new access token.                |
| `GET`  | `/api/users`                             | Yes       | Returns all users.                                                               |
| `GET`  | `/api/users/:id`                         | Yes       | Returns one user by id.                                                          |

Protected routes use `authMiddleware`, which expects an access token in the `Authorization` header:

```text
Authorization: Bearer <accessToken>
```

### Registration Flow

`controllers/register.js` handles account creation.

Flow:

1. Read `name`, `email`, and `password` from the request body.
2. Check if a user with the same email already exists.
3. Hash the password with `bcrypt.hash(password, 10)`.
4. Generate a UUID for `emailVerificationId`.
5. Create the user in MongoDB.
6. Build a verification link with `API_URL`.
7. Send the verification email with Nodemailer.
8. Generate an access token and refresh token.
9. Store the refresh token in MongoDB.
10. Set the refresh token as an HTTP-only cookie.
11. Return `201` with:

```json
{
  "accessToken": "jwt_access_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### Login Flow

`controllers/login.js` handles authentication for existing users.

Flow:

1. Read `email` and `password` from the request body.
2. Find the user by email.
3. Compare the submitted password with the stored bcrypt hash.
4. Create a small user payload containing `id`, `email`, and `name`.
5. Generate a new access token and refresh token.
6. Save the refresh token in MongoDB.
7. Set the refresh token as an HTTP-only cookie.
8. Return `200` with the access token and user payload.

If the user is not found or the password is invalid, the backend returns a `400` error.

### JWT and Refresh Tokens

`services/token/generateTokens.js` creates two JWTs:

- Access token signed with `JWT_ACCESS_SECRET`.
- Refresh token signed with `JWT_REFRESH_SECRET`.

Current expiration values:

```js
accessToken: "15m";
refreshToken: "30d";
```

The access token is intentionally short-lived, while the refresh token lasts longer and matches the refresh-token cookie lifetime.

`setupRefreshToken()` writes the refresh token to an HTTP-only cookie:

```js
res.cookie("refreshToken", refreshToken, {
  maxAge: 30 * 24 * 60 * 60 * 1000,
  httpOnly: true,
});
```

Because the cookie is HTTP-only, frontend JavaScript cannot read it directly. The browser sends it automatically when requests are made with credentials enabled.

### Refresh Flow

`controllers/refresh.js` is responsible for issuing a new access token.

Flow:

1. Read `refreshToken` from `req.cookies`.
2. Verify the JWT with `JWT_REFRESH_SECRET`.
3. Check that the refresh token exists in MongoDB.
4. Find the user from the token payload.
5. Generate a new access token and refresh token.
6. Store the new refresh token in MongoDB.
7. Set the new refresh token cookie.
8. Return the new access token:

```json
{
  "accessToken": "new_jwt_access_token"
}
```

If the cookie is missing, invalid, not found in the database, or points to a missing user, the backend throws a `401 Unauthorized` error.

### Logout Flow

`controllers/logout.js` handles logout.

The route is protected by `authMiddleware`, so the user must send a valid access token. The controller:

1. Reads `refreshToken` from cookies.
2. Deletes that token from MongoDB.
3. Clears the `refreshToken` cookie.
4. Returns:

```json
{
  "message": "Logged out successfully"
}
```

### Email Verification

During registration, the backend creates a UUID and stores it as `emailVerificationId` on the user document.

`sendVerificationEmail()`:

- Reads `html/verify-email-message.html`.
- Replaces template variables like `{{APP_NAME}}`, `{{VERIFY_LINK}}`, and `{{CURRENT_YEAR}}`.
- Sends the email through Nodemailer using the SMTP environment variables.

When the user opens:

```text
GET /api/verify-email/:emailVerificationId
```

`controllers/verifyEmail.js`:

1. Finds the user with the matching verification id.
2. Sets `isEmailVerified` to `true`.
3. Saves the user.
4. Redirects to `CLIENT_URL`.

If the verification id is invalid, the backend returns a `400` error.

### Validation

Request validation uses `express-validator`.

Registration requires:

- `name` length between 2 and 100 characters.
- Valid `email`.
- `password` length between 3 and 32 characters.

Login requires:

- Valid `email`.

`middlewares/validation.js` collects validation errors and returns:

```json
{
  "message": "Validation error",
  "errors": []
}
```

### Authentication Middleware

`middlewares/auth.js` protects private routes.

It:

1. Reads the `Authorization` header.
2. Extracts the token from `Bearer <token>`.
3. Verifies the token with `validateAccessToken()`.
4. Calls `next()` when the token is valid.
5. Throws `401 Unauthorized` when the token is missing or invalid.

The middleware validates access but does not currently attach the decoded user payload to `req`. Controllers that need user-specific data receive it through route params or other inputs.

### Error Handling

Controllers pass errors to `next(error)`.

`middlewares/error.js` sends:

- `err.status` and `err.message` when a known status is provided.
- `500` with `Unexpected server error` for unhandled errors.

Unknown routes return:

```json
{
  "message": "Endpoint not found"
}
```

### Running the Backend

From the backend directory:

```bash
cd back-end
npm install
npm run dev
```

The `dev` script starts the server with Nodemon:

```bash
nodemon index.js
```

By default, the API runs on:

```text
http://localhost:5000
```

### Example Requests

Register:

```http
POST /api/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

Login:

```http
POST /api/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

Refresh:

```http
GET /api/refresh
Cookie: refreshToken=<refreshToken>
```

Get users:

```http
GET /api/users
Authorization: Bearer <accessToken>
```

Logout:

```http
POST /api/logout
Authorization: Bearer <accessToken>
Cookie: refreshToken=<refreshToken>
```

## Front-end Implementation plan

## Front-end Task List

- [x] Write a CSS config with vars for colors, gaps...
- [x] Configure environment variables for the frontend API base URL, for example `REACT_APP_API_URL=http://localhost:5000/api`.
- [x] Create a shared Axios client with `baseURL`, `withCredentials: true`, and typed response handling.
- [x] Add an Axios request interceptor that attaches the current access token to protected requests with `Authorization: Bearer <token>`.
- [x] Add an Axios response interceptor that handles `401` responses, calls `/refresh`, saves the new access token, and retries the original request.
- [x] Add refresh request queueing so multiple expired requests trigger only one `/refresh` call.
- [x] Define shared TypeScript types for `User`, `AuthResponse`, API errors, login payloads, and registration payloads.
- [x] Create endpoint constants for `/register`, `/login`, `/logout`, `/refresh`, `/users`, and `/users/:id`.
- [x] Create an authentication service layer with `register`, `login`, `logout`, `refresh`, `getUsers`, and `getUserById` API functions. Every function in a separate file.
- [x] Add TanStack Query configuration with a shared `QueryClient`, query keys, and default retry/error behavior.
- [x] Create auth mutation hooks for registration, login, and logout.
- [x] Create protected user query hooks for fetching the users list and a single user by id.
- [x] Build an `AuthProvider` that stores the authenticated user, auth status, startup loading state, and access token handling.
- [x] Add app initialization logic that silently calls `/refresh` on load to restore an existing cookie-based session.
- [x] Implement logout cleanup that clears local auth state, removes the access token, and invalidates user-related queries.
- [x] Configure React Router with route constants and a central route tree.
- [x] Build `ProtectedRoute` to redirect guests away from authenticated pages.
- [x] Build `PublicRoute` to redirect authenticated users away from login and registration pages.
- [x] Create Zod schemas that match backend validation rules for registration and login.
- [x] Build reusable form components such as `Button`, `Input`, `FormError`, and loading states.
- [x] Implement the registration page with React Hook Form, Zod validation, API error display, and success feedback.
- [x] Implement the login page with React Hook Form, Zod validation, API error display, and redirect after success.
- [x] Implement the dashboard page that shows the authenticated user state.
- [x] Implement the email verification success route that is shown after the backend redirects to `CLIENT_URL`.
- [x] Add graceful session-expired handling when refresh fails or cookies are unavailable.
- [x] Add loading screens for startup auth checks and protected route transitions.
- [x] Add empty, error, and retry states for protected data views.
- [ ] Test the full happy path: register, verify email, login, refresh token, view users, and logout.
- [ ] Test failure paths: invalid form data, wrong credentials, expired access token, missing refresh cookie, and protected route access while logged out.
- [x] Document frontend setup, environment variables, and run commands in the README.

Note: the current backend exposes `GET /api/users/:id`, but not `GET /api/users`. The frontend includes a users-list query hook for the planned endpoint and uses the available protected user-by-id endpoint in the dashboard.

### Running the Frontend

From the frontend directory:

```bash
cd front-end
npm install
npm start
```

The frontend expects:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

The app runs on:

```text
http://localhost:3000
```

The `start` and `build` scripts set `NODE_OPTIONS=--openssl-legacy-provider` through `cross-env` because this project uses React Scripts 4, which needs that compatibility flag on newer Node.js versions.

## Phase 1: Task Decomposition

### 1. Networking & API Layer

- **Axios Configuration:** Setup base instance with `withCredentials: true`.
- **Intercept Management:** Logic to catch 401s, trigger the `/refresh` endpoint, and retry failed requests.
- **API Contracts:** TypeScript interfaces mapping exactly to the backend responses.

### 2. Authentication State Management

- **Auth Provider:** A React Context to manage `user` data and `isAuth` status.
- **Initialization Logic:** Checking for an existing session on app load (silent refresh).

### 3. Logic & Data Fetching (TanStack Query)

- **Auth Hooks:** Custom hooks for `useLogin`, `useRegister`, and `useLogout`.
- **User Hooks:** Hooks to fetch the protected `/users` list.

### 4. Routing & Protection

- **Private Route Wrapper:** Component to guard sensitive routes.
- **Public Route Wrapper:** Prevents logged-in users from seeing the Login/Register pages.

### 5. UI Components & Forms

- **Form Validation:** Using Zod for schema validation (matching backend `express-validator` rules).
- **Pages:** Login, Registration, Dashboard (User List), and Email Verification Success landing page.

React Hook Form reduces the amount of code you need to write while removing unnecessary re-renders. Now dive in and explore with the following example:

```
import { useState } from "react";
import { useForm } from "react-hook-form";
import Header from "./Header";

export function App() {
  const { register, handleSubmit } = useForm();
  const [data, setData] = useState("");

  return (
    <form onSubmit={handleSubmit((data) => setData(JSON.stringify(data)))}>
      <Header />
      <input {...register("firstName")} placeholder="First name" />
      <select {...register("category", { required: true })}>
        <option value="">Select...</option>
        <option value="A">Option A</option>
        <option value="B">Option B</option>
      </select>
      <textarea {...register("aboutYou")} placeholder="About you" />
      <p>{data}</p>
      <input type="submit" />
    </form>
  );
}
```

---

## Phase 2: Low-Level Design (LLD)

### 1. Networking Layer (Axios Interceptors)

This is the "heart" of your auth flow. It ensures the UI doesn't break when the 15-minute access token expires.

- **Data Structures:**

```typescript
interface AuthResponse {
  accessToken: string;
  user: User;
}
```

- **Logic Flow:**

1. Create an Axios instance `api`.
2. **Request Interceptor:** Attach `Authorization: Bearer <token>` from local state.
3. **Response Interceptor:**

- If response is `2xx`, return data.
- If `401` AND `!originalRequest._retry`:
- Set `_retry = true`.
- Call `GET /api/refresh`.
- Store new `accessToken`.
- Retry the `originalRequest` with the new token.

- **Error Handling:** If `/refresh` also returns `401`, clear local state and redirect to `/login`.

```
export const API_URL = `http://localhost:5000/api`

const api = axios.create({
    withCredentials: true,
    baseURL: API_URL
})

api.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
    return config;
})

api.interceptors.response.use((config) => {
    return config;
},async (error) => {
    const originalRequest = error.config;
    if (error.response.status == 401 && error.config && !error.config._isRetry) {
        originalRequest._isRetry = true;
        try {
            const response = await axios.get<AuthResponse>(`${API_URL}/refresh`, {withCredentials: true})
            localStorage.setItem('token', response.data.accessToken);
            return api.request(originalRequest);
        } catch (e) {
            // handle error
        }
    }
    throw error;
})

export default api;
```

### 2. Authentication Context (Auth Service)

- **Data Structures:**

```typescript
interface AuthContextType {
  user: User | null;
  isAuth: boolean;
}
```

- **Logic Flow (checkAuth):**

1. On App mount, call `useRefresh()`.
2. If successful, update `user` state and store `accessToken` in memory.
3. Set `isLoading` to false only after this check completes.

### 3. Form Validation (Zod Schemas)

To prevent unnecessary API calls and match backend constraints.

- **Logic:**
- `RegisterSchema`: `name` (2-100 chars), `email` (valid format), `password` (3-32 chars).
- `LoginSchema`: `email` (valid format), `password` (required).

- **Error Handling:** Use Zod's `safeParse` to display real-time inline errors to the user before the "Submit" button is enabled.

### 4. Routing Architecture

- **Components:**
- `<ProtectedRoute />`: Checks `isAuth`. If false, redirects to `/login`.
- `<PublicRoute />`: Checks `isAuth`. If true, redirects to `/dashboard`.

- **Dependencies:** React Router Dom (v6+ recommended) and the `AuthContext`.

### 5. Logic Layer (TanStack Query Integration)

- **Task:** Wrap Axios calls in `useMutation` and `useQuery`.
- **Logic:**
- `useLogin`: On `onSuccess`, update `AuthContext` state.
- `useUsers`: Fetch `/api/users`. Enable only if `isAuth` is true.

- **Edge Case:** If the user opens multiple tabs and logs out in one, TanStack Query should trigger a refetch or the interceptor should catch the `401` in the second tab.

---

## Recommended Project Structure

## src/

### api/

Global infrastructure for network requests and server state.

- **endpoints.ts**: Centralized ENDPOINTS object serving as the single source of truth for all API URLs.

### lib/

Third-party library configurations.

**axios/** folder. Centralized API client configuration and network logic.

- **instance.ts**: Axios configuration including base URL, auth headers, interceptors, 401 Unauthorized handling, and silent token refresh logic.

- **interceptors/**: Separated request/response interceptor logic.

- **types.ts**: Axios-specific internal typings.

**tanstack-query/** folder. Server state management and caching configuration.

- **query-client.ts**: Global TanStack Query client configuration.

- **query-keys.ts**: Static constants for TanStack Query cache keys to ensure consistent data invalidation.

- **types.ts**: Shared TanStack Query utility typings.

### router/

Application navigation and routing logic.

- **paths.ts**: Route path constants used throughout the app (e.g., PATHS.auth.login).
- **index.tsx**: Main RouterProvider setup and route tree definitions.
- **components/**: Route guards including ProtectedRoute for authenticated sessions and PublicRoute for guest access, plus Layout wrappers.

### features/

Business logic organized into horizontal modules. Each subdirectory represents a self-contained domain.

- **[feature-name]/** (e.g., auth, billing)
- **api/**: Pure Axios or Fetch functions (e.g., getProfile, updateBilling) plus a file with type definitions for feature-specific requests and responses.
- **types/**: Feature-local UI or internal types.
- **constants/**: Domain-specific configuration.
- **hooks/**: React hooks.
- **services/**: Sometimes you have complex logic that isn't a Hook or a Component. Local utility functions (e.g., formatCurrencyForBilling, calculateAuthStrength).
- **queries/**: TanStack Query hooks.
- **components/**: Private components used exclusively within this specific feature.
- **pages/**: Feature-level screens and page components.
- **validation/**: Zod schemas or validation rules for feature forms.
- **index.tsx**: It acts as a gatekeeper. You export only what the rest of the app is allowed to see.

### components/

Shared UI-KIT components.

Will have a ui/ folder for Atomic, stateless components such as Button, Input, Modal, and Badge and layout folder for complex shared components used across features, such as AppHeader or Sidebar.

### contexts/

Global React Context providers.

### hooks/

Global, reusable custom React hooks.

### utils/

Pure helper functions and utilities.

### theme/

Global styling configuration and design system tokens. (colors, breakpoints or Tailwind configuration etc.)

### types/

Global TypeScript declarations for domain models.

### **constants.tsx**:

For things like APP_TITLE, SUPPORT_EMAIL, or global pagination defaults that aren't specific to a feature.

### errors/

Centralized application error handling.

- **api-error.ts**: API error normalization.
- **error-codes.ts**: Shared application error codes.
- **handlers/**: Global error handling utilities.
- **boundaries/**: React Error Boundaries.

### Entry Files

- **main.tsx**: Application entry point for the build tool.
- **App.tsx**: Root component containing the Provider tree (QueryClientProvider, AuthProvider, RouterProvider).

### Critical Edge Cases to Handle:

1. **Token Expired during a Bulk Request:** If the UI triggers 3 simultaneous API calls while the token is expired, ensure only **one** `/refresh` call is made (Request Queueing).
2. **Email Verification Redirect:** The backend redirects to `CLIENT_URL`. The frontend must have a route handler that shows a "Verification Successful" message and prompts the user to login.
3. **No Cookies Support:** If the browser blocks 3rd party cookies (though unlikely here as it's same-site), the refresh flow will fail. Ensure the UI shows a graceful "Session Expired" message.
