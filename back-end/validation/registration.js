const { body } = require("express-validator");

const registrationValidation = [
  body("email").isEmail(),
  body("password").isLength({ min: 3, max: 32 }),
];

module.exports = registrationValidation;