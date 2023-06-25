const { body } = require("express-validator");

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address"),
];

module.exports = loginValidation;
