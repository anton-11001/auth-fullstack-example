const { body } = require("express-validator");

const loginValidation = [
  body("email").isEmail("Please provide a valid email address"),
];

module.exports = loginValidation;
