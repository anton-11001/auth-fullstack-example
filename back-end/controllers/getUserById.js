const findUserById = require("../db/user/findUserById");

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await findUserById(id);

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    return res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = getUserById;
