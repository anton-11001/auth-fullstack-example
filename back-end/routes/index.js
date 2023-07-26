const Router = require("express").Router;

const register = require("../controllers/register");
const login = require("../controllers/login");
const logout = require("../controllers/logout");
const verifyEmail = require("../controllers/verifyEmail");
const refresh = require("../controllers/refresh");
const getUsers = require("../controllers/getUsers");
const getUserById = require("../controllers/getUserById");

const registrationValidation = require("../validation/registration");
const loginValidation = require("../validation/login");

const validationMiddleware = require("../middlewares/validation");
const authMiddleware = require("../middlewares/auth");

const router = new Router();

router.post(
  "/register",
  registrationValidation,
  validationMiddleware,
  register,
);

router.post("/login", loginValidation, validationMiddleware, login);

router.post("/logout", authMiddleware, logout);

router.get("/verify-email/:emailVerificationId", verifyEmail);

router.get("/refresh", refresh);

router.get("/users", authMiddleware, getUsers);

router.get("/users/:id", authMiddleware, getUserById);

module.exports = router;
