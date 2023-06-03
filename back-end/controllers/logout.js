const deleteToken = require("../db/tokens/deleteToken");

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    await deleteToken(refreshToken);
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = logout;
