const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("A user with this email could not be found.");
    error.statusCode = 401;
    throw error;
  }

  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) {
    const error = new Error("Incorrect email or password.");
    error.statusCode = 401;
    throw error;
  }

  next();
};

exports.userExists = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  next();
};
