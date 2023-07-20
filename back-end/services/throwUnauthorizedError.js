const throwUnauthorizedError = () => {
  const error = new Error("Unauthorized");
  error.status = 401;
  throw error;
};

module.exports = throwUnauthorizedError;
