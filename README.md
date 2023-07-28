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
- `db/user/getUsers.js` returns all users.
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

| Method | Route | Protected | Description |
| --- | --- | --- | --- |
| `POST` | `/api/register` | No | Creates a user, sends verification email, returns access token and user payload. |
| `POST` | `/api/login` | No | Validates credentials, returns access token and user payload. |
| `POST` | `/api/logout` | Yes | Deletes the current refresh token and clears the refresh-token cookie. |
| `GET` | `/api/verify-email/:emailVerificationId` | No | Marks the matching user email as verified and redirects to the client. |
| `GET` | `/api/refresh` | No | Validates the refresh-token cookie and issues a new access token. |
| `GET` | `/api/users` | Yes | Returns all users. |
| `GET` | `/api/users/:id` | Yes | Returns one user by id. |

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
accessToken: "15s"
refreshToken: "30s"
```

These short lifetimes are useful for testing refresh behavior. For a real application, they should usually be increased.

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
