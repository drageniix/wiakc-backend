const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = async (req, res, next) => {
  const { email, name, password, country } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);
  new User({
    email,
    password: hashedPassword,
    name,
    country
  })
    .save()
    .then(user => {
      user.sendConfirmEmail();
      const response = login(user);
      return res.status(201).json(response);
    })
    .catch(err => next(err));
};

exports.updateUserPrivilege = (res, req, next) =>
  User.findOneAndUpdate(
    { _id: req.body.userId },
    { $set: { privilege: req.body.privilege } },
    { new: true }
  )
    .exec()
    .then(
      user =>
        user &&
        res.status(201).json({
          user: {
            name: user.name,
            country: user.country,
            email: user.email,
            privilege: user.privilege
          },
          message: "User updated."
        })
    )
    .catch(err => next(err));

exports.login = async (req, res, next) =>
  User.findOne({ email: req.body.email })
    .then(user => {
      const response = login(user);
      res.status(200).json(response);
    })
    .catch(err => next(err));

exports.updateUserDetails = async (req, res, next) => {
  let updateInfo = {
    email: req.body.email,
    name: req.body.name,
    country: req.body.country
  };

  if (req.body.password) {
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    updateInfo.password = hashedPassword;
  }

  User.findOneAndUpdate(
    { _id: req.userId },
    { $set: updateInfo },
    { new: true }
  )
    .exec()
    .then(user =>
      res.status(201).json({
        user: {
          name: user.name,
          country: user.country,
          email: user.email,
          privilege: user.privilege
        },
        message: "User updated."
      })
    )
    .catch(err => next(err));
};

exports.initiateResetPassword = (req, res, next) =>
  User.findOne({ email: req.body.email })
    .then(user => {
      user.sendResetPasswordEmail();
      res.status(200).json({ message: "Email sent." });
    })
    .catch(err => next(err));

exports.resetPassword = async (req, res, next) => {
  const password = await bcrypt.hash(req.body.password, 12);

  User.findOneAndUpdate(
    {
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExpiration: { $gt: Date.now() }
    },
    {
      $set: {
        password,
        tempToken: undefined,
        tempTokenExpiration: undefined
      }
    }
  )
    .exec()
    .then(() => res.status(200).json({ message: "Password reset." }))
    .catch(err => next(err));
};

function login(user) {
  return {
    token:
      "Bearer " +
      jwt.sign(
        {
          email: user.email,
          userId: user._id.toString()
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      ),
    user: {
      name: user.name,
      country: user.country,
      email: user.email,
      privilege: user.privilege
    },
    userId: user._id.toString(),
    privilege: user.privilege
  };
}
