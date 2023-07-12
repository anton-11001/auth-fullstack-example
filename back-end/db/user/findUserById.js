const UserModel = require("../../models/user");

const findUserById = async (id) => await UserModel.findById(id);

module.exports = findUserById;
