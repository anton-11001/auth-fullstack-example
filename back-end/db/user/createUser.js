const UserModel = require("../../models/user");

const createUser = async (email, hashPassword, activationLink) => {
  return await UserModel.create({
    email,
    password: hashPassword,
    activationLink,
  });
};

module.exports = createUser;
