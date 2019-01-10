const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator/check");

exports.isAuth = (req, res, next) => {
  let decodedToken;
  const authHeader = req.get("Authorization");
  if (
    authHeader &&
    (decodedToken = jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_SECRET
    ))
  ) {
    req.userId = decodedToken.userId;
  } else {
    const authError = new Error("Not authenticated.");
    authError.statusCode = 401;
    throw authError;
  }
  next();
};

exports.inputValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  next();
};
