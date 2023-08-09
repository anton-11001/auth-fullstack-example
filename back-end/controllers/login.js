const bcrypt = require("bcrypt");

const generateTokens = require("../services/token/generateTokens");
const setupRefreshToken = require("../services/token/setupRefreshToken");
const findUser = require("../db/user/findUser");
const saveToken = require("../db/tokens/saveToken");
const UserDto = require("../dtos/user");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const candidate = await findUser(email);

    if (!candidate) {
      const error = new Error(`User with email ${email} not found`);
      error.status = 400;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, candidate.password);

    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.status = 400;
      throw error;
    }

    const userPayload = new UserDto(candidate);

    const tokens = generateTokens(userPayload);

    await saveToken(userPayload.id, tokens.refreshToken);

    setupRefreshToken(res, tokens.refreshToken);

    const response = {
      accessToken: tokens.accessToken,
      user: userPayload,
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = login;
