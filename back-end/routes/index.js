const Router = require("express").Router;

const register = require("../controllers/register");
const login = require("../controllers/login");
const logout = require("../controllers/logout");
const activateEmail = require("../controllers/activateEmail");
const refresh = require("../controllers/refresh");
const getUsers = require("../controllers/getUsers");

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
router.get("/activate-email/:link", activateEmail);
router.get("/refresh", refresh);
router.get("/users", authMiddleware, getUsers);

module.exports = router;
