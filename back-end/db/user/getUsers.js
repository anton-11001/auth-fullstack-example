const UserModel = require("../../models/user");

const getUsers = async () => {
  return await UserModel.find();
};

module.exports = getUsers;
