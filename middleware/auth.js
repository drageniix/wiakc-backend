const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { body } = require("express-validator/check");
const commonMiddleware = require("./common");

exports.validateSignup = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom((email, { req }) =>
      User.findOne({ email }).then(user => {
        if (user) {
          Promise.reject("A user with this email already exists.");
        }
      })
    )
    .normalizeEmail(),
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
    .custom((email, { req }) =>
      User.findOne({ email }).then(user => {
        if (!user) {
          Promise.reject("A user with this email could not be found.");
        }
      })
    )
    .normalizeEmail(),
  body("password")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters")
    .custom((password, { req: { body: { email } } }) =>
      User.findOne({ email })
        .then(user => bcrypt.compare(password, user.password))
        .then(match => {
          if (!match) {
            Promise.reject("Incorrect email or password.");
          }
        })
    ),
  commonMiddleware.inputValidation
];
