const bcrypt = require("bcrypt");
const uuid = require("uuid");
const generateTokens = require("../services/token/generateTokens");
const sendActivationEmail = require("../services/sendActivationEmail");
const createUser = require("../db/user/createUser");
const findUser = require("../db/user/findUser");
const saveToken = require("../db/tokens/saveToken");

const ONE_MONTH_IN_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;

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

    const activationId = uuid.v4();

    const emailVerificationLink = `${process.env.API_URL}/api/activate/${activationId}`;

    const newUser = {
      name,
      email,
      password: hashPassword,
      emailVerificationLink,
    };

    const user = await createUser(newUser);

    await sendActivationEmail(email, emailVerificationLink);

    const userPayload = {
      id: user._id,
      email: user.email,
      name: user.name,
    };

    const tokens = generateTokens(userPayload);

    await saveToken(userPayload.id, tokens.refreshToken);

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: ONE_MONTH_IN_MILLISECONDS,
      httpOnly: true,
    });

    return res.json(userPayload);
  } catch (error) {
    next(error);
  }
};

module.exports = register;
