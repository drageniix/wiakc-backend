const express = require("express");

const multer = require("../middleware/files");
const commonMiddleware = require("../middleware/common");
const authMiddleware = require("../middleware/auth");
const authController = require("../controllers/auth");

const router = express.Router();

router.post("/signup", authMiddleware.validateSignup, authController.signup);

router.post(
  "/privilege",
  authMiddleware.validatePrivilege,
  authController.updateUserPrivilege
);

router.post("/login", authMiddleware.validateLogin, authController.login);

router.put(
  "/update",
  commonMiddleware.isAuth,
  multer,
  authMiddleware.validateUpdate,
  authController.updateUserDetails
);

router.post(
  "/reset",
  authMiddleware.validateInitiateReset,
  authController.initiateResetPassword
);

router.put(
  "/reset",
  authMiddleware.validateReset,
  authController.resetPassword
);

module.exports = router;
