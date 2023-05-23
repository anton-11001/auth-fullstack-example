const { body } = require("express-validator");

const registrationValidation = [
  body("name").isLength({ min: 2, max: 100 }),
  body("email").isEmail(),
  body("password").isLength({ min: 3, max: 32 }),
];

module.exports = registrationValidation;
