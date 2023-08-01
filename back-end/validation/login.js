const { body } = require("express-validator");

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 3, max: 32 })
    .withMessage("Password must be between 3 and 32 characters"),
];

module.exports = loginValidation;
