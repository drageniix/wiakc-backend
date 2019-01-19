const express = require("express");

const authController = require("../controllers/auth");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/signup", authMiddleware.validateSignup, authController.signup);

router.post("/login", authMiddleware.validateLogin, authController.login);

module.exports = router;
