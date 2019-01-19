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
      const response = login(user);
      return res.status(201).json(response);
    });
};

exports.login = async (req, res, next) =>
  User.findOne({ email: req.body.email })
    .then(user => {
      const response = login(user);
      res.status(200).json(response);
    })
    .catch(err => next(err));

function login(user) {
  return {
    token: jwt.sign(
      {
        email: user.email,
        userId: user._id.toString()
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    ),
    userId: user._id.toString(),
    privilege: user.privilege
  };
}
