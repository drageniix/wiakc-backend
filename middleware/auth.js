const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { body } = require("express-validator/check");
const commonMiddleware = require("./common");

exports.validateSignup = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email.")
    .custom((email, { req }) =>
      User.findOne({ email }).then(user => {
        if (user) {
          throw new Error("A user with this email already exists.");
        }
      })
    ),
  body("password")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters."),
  body("confirm_password")
    .trim()
    .custom((confirmedPassword, { req: { body: { password } } }) => {
      if (confirmedPassword !== password) {
        throw new Error("Passwords don't match.");
      }
    }),
  body("name")
    .trim()
    .not()
    .isEmpty(),
  commonMiddleware.inputValidation
];

exports.validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email.")
    .custom((email, { req }) =>
      User.findOne({ email }).then(user => {
        if (!user) {
          throw new Error("A user with this email could not be found.");
        } else {
          req.loginAttemptPW = user.password;
        }
      })
    ),
  body("password")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters")
    .custom(async (password, { req: { loginAttemptPW } }) => {
      if (loginAttemptPW && !(await bcrypt.compare(password, loginAttemptPW))) {
        throw new Error("Incorrect email or password.");
      }
    }),
  commonMiddleware.inputValidation
];
