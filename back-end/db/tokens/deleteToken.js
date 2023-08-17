const TokenModel = require("../../models/token");

const deleteToken = async (refreshToken) =>
  await TokenModel.deleteOne({ refreshToken });

module.exports = deleteToken;
