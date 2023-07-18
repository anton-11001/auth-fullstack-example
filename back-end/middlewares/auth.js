const validateAccessToken = require("../services/token/validateAccessToken");
const throwUnauthorizedError = require("../services/throwUnauthorizedError");

const authMiddleware = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      throwUnauthorizedError();
    }

    const accessToken = authorizationHeader.split(" ")[1];

    if (!accessToken) {
      throwUnauthorizedError();
    }

    const isValidToken = validateAccessToken(accessToken);

    if (!isValidToken) {
      throwUnauthorizedError();
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
