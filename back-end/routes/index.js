const Router = require("express").Router;

const register = require("../controllers/register");
const login = require("../controllers/login");
const logout = require("../controllers/logout");
const activateEmail = require("../controllers/activateEmail");
const refresh = require("../controllers/refresh");
const getUsers = require("../controllers/getUsers");

const router = new Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/activate-email/:link", activateEmail);
router.get("/refresh", refresh);
router.get("/users", getUsers);

module.exports = router;
