const jwt = require("jsonwebtoken");

const validateRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports = validateRefreshToken;
