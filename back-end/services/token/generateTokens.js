const jwt = require("jsonwebtoken");

const generateTokens = (payload) => {
  const tokenPayload = { ...payload };

  const accessToken = jwt.sign(tokenPayload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });

  return {
    accessToken,
    refreshToken,
  };
};

module.exports = generateTokens;
