const throwUnauthorizedError = require("../services/throwUnauthorizedError");
const validateRefreshToken = require("../services/token/validateRefreshToken");
const findToken = require("../db/tokens/findToken");
const findUserById = require("../db/user/findUserById");
const generateTokens = require("../services/token/generateTokens");
const setupRefreshToken = require("../services/token/setupRefreshToken");
const saveToken = require("../db/tokens/saveToken");
const UserDto = require("../dtos/user");

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throwUnauthorizedError();
    }

    const userPayload = validateRefreshToken(refreshToken);

    const isValidToken = Boolean(userPayload);

    if (!isValidToken) {
      throwUnauthorizedError();
    }

    const tokenFromDb = await findToken(refreshToken);

    if (!tokenFromDb) {
      throwUnauthorizedError();
    }

    const user = await findUserById(userPayload.id);

    if (!user) {
      throwUnauthorizedError();
    }

    const freshUserPayload = new UserDto(user);

    const { accessToken, refreshToken: newRefreshToken } =
      generateTokens(freshUserPayload);

    await saveToken(freshUserPayload.id, newRefreshToken);

    setupRefreshToken(res, newRefreshToken);

    return res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

module.exports = refresh;
