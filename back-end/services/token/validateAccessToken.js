const jwt = require("jsonwebtoken");

const validateAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports = validateAccessToken;
