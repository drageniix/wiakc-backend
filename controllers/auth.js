const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = async (req, res, next) => {
  const { email, name, password, country } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await new User({
    name,
    email,
    country,
    password: hashedPassword
  }).save();

  return res.status(201).json(login(user));
};

exports.login = async (req, res, next) =>
  res.status(200).json(login(await User.findOne({ email: req.body.email })));

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
