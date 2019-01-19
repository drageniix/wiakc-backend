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
  body("name")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please give a name."),
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters."),
  body("confirm_password").custom((confirmedPassword, { req }) => {
    if (confirmedPassword !== req.body.password) {
      throw new Error("Passwords don't match.");
    } else return true;
  }),
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
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters")
    .custom(async (password, { req: { loginAttemptPW } }) => {
      if (loginAttemptPW && !(await bcrypt.compare(password, loginAttemptPW))) {
        throw new Error("Incorrect email or password.");
      }
    }),
  commonMiddleware.inputValidation
];
