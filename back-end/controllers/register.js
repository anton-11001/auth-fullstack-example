const bcrypt = require("bcrypt");
const uuid = require("uuid");
const generateTokens = require("../services/token/generateTokens");
const setupRefreshToken = require("../services/token/setupRefreshToken");
const sendVerificationEmail = require("../services/sendVerificationEmail");
const createUser = require("../db/user/createUser");
const findUser = require("../db/user/findUser");
const saveToken = require("../db/tokens/saveToken");

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const candidate = await findUser(email);

    if (candidate) {
      const error = new Error(`User with email ${email} already exists`);
      error.status = 400;
      throw error;
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const emailVerificationId = uuid.v4();

    const newUser = {
      name,
      email,
      password: hashPassword,
      emailVerificationId,
    };

    const user = await createUser(newUser);

    const emailVerificationLink = `${process.env.API_URL}/api/verify-email/${emailVerificationId}`;

    await sendVerificationEmail(email, emailVerificationLink);

    const userPayload = {
      id: user._id,
      email: user.email,
      name: user.name,
    };

    const tokens = generateTokens(userPayload);

    await saveToken(userPayload.id, tokens.refreshToken);

    setupRefreshToken(res, tokens.refreshToken);

    const response = {
      accessToken: tokens.accessToken,
      user: userPayload,
    };

    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = register;
