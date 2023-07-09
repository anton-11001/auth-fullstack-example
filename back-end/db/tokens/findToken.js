const TokenModel = require("../../models/token");

const findToken = async (refreshToken) =>
  await TokenModel.findOne({ refreshToken });

module.exports = findToken;
