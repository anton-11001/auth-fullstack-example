const getUsersFromDb = require("../db/user/getUsers");
const UserDto = require("../dtos/user");

const getUsers = async (req, res, next) => {
  try {
    const users = await getUsersFromDb();
    res.json(users.map((user) => new UserDto(user)));
  } catch (error) {
    next(error);
  }
};

module.exports = getUsers;
