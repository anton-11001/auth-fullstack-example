const getUsersFromDb = require("../db/user/getUsers");

const getUsers = async (req, res, next) => {
  try {
    const users = await getUsersFromDb();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = getUsers;
