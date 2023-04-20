const TokenModel = require("../../models/token");

const saveToken = async (userId, refreshToken) => {
  const existingToken = await TokenModel.findOne({ user: userId });

  if (existingToken) {
    existingToken.refreshToken = refreshToken;
    return existingToken.save();
  }

  const token = await TokenModel.create({ user: userId, refreshToken });

  return token;
};

module.exports = saveToken;
