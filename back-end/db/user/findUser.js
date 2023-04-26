const UserModel = require("../../models/user");

const findUser = async (email) => await UserModel.findOne({ email });

module.exports = findUser;