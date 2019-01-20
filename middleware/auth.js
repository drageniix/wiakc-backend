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

exports.validatePrivilege = [
  body("userId").isAlphanumeric(),
  body("token").custom((token, { req: { body: { userId } } }) =>
    User.findById(userId).then(user => {
      if (user.tempToken !== token) {
        Promise.reject("Token does not match,");
      }
    })
  ),
  body("privilege")
    .isNumeric()
    .withMessage("Invalid privilege value."),
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

exports.validateUpdate = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email."),
  body("name")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please give a name."),
  body("password").custom(password => {
    if (password.length !== 0 && password.length < 5) {
      throw new Error("Password must be at least 5 characters.");
    } else return true;
  }),
  body("confirm_password").custom((confirmedPassword, { req }) => {
    if (confirmedPassword !== req.body.password) {
      throw new Error("Passwords don't match.");
    } else return true;
  }),
  body("old_password")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters")
    .custom((password, { req: { userId } }) =>
      User.findById(userId).then(async user => {
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          throw new Error("Incorrect password.");
        }
      })
    ),
  commonMiddleware.inputValidation
];

exports.validateInitiateReset = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email.")
    .custom((email, { req }) =>
      User.findOne({ email }).then(user => {
        if (!user) {
          throw new Error("User does not exist.");
        }
      })
    ),
  commonMiddleware.inputValidation
];

exports.validateReset = [
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters"),
  commonMiddleware.inputValidation
];
