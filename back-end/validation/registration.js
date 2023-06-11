const { body } = require("express-validator");

const registrationValidation = [
  body("name").isLength(
    { min: 2, max: 100 },
    "Name must be between 2 and 100 characters",
  ),
  body("email").isEmail("Please provide a valid email address"),
  body("password").isLength(
    { min: 3, max: 32 },
    "Password must be between 3 and 32 characters",
  ),
];

module.exports = registrationValidation;
