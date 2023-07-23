const ONE_MONTH_IN_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;

const setupRefreshToken = (res, refreshToken) =>
  res.cookie("refreshToken", refreshToken, {
    maxAge: ONE_MONTH_IN_MILLISECONDS,
    httpOnly: true,
  });

module.exports = setupRefreshToken;
