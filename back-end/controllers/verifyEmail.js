const UserModel = require("../models/user");

const verifyEmail = async (req, res, next) => {
  try {
    const emailVerificationId = req.params.emailVerificationId;

    const user = await UserModel.findOne({ emailVerificationId });

    if (!user) {
      const error = new Error("Invalid email verification link");
      error.status = 400;
      throw error;
    }

    user.isEmailVerified = true;

    await user.save();

    return res.redirect(process.env.CLIENT_URL);
  } catch (error) {
    next(error);
  }
};

module.exports = verifyEmail;
