const UserModel = require("../../models/user");

const createUser = async (user) => {
  return await UserModel.create(user);
};

module.exports = createUser;
