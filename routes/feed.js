const express = require("express");
const { body } = require("express-validator/check");

const feedController = require("../controllers/feed");
const feedMiddleware = require("../middleware/feed");
const commonMiddleware = require("../middleware/common");

const router = express.Router();

router.get("/posts", commonMiddleware.isAuth, feedController.getPosts);

router.post(
  "/post",
  commonMiddleware.isAuth,
  [
    body("title")
      .trim()
      .isLength({ min: 5 }),
    body("content")
      .trim()
      .isLength({ min: 5 })
  ],
  commonMiddleware.inputValidation,
  feedController.createPost
);

router.get("/post/:postId", commonMiddleware.isAuth, feedController.getPost);

router.put(
  "/post/:postId",
  commonMiddleware.isAuth,
  [
    body("title")
      .trim()
      .isLength({ min: 5 }),
    body("content")
      .trim()
      .isLength({ min: 5 })
  ],
  commonMiddleware.inputValidation,
  feedMiddleware.alterPost,
  feedController.updatePost
);

router.delete(
  "/post/:postId",
  commonMiddleware.isAuth,
  feedMiddleware.alterPost,
  feedController.deletePost
);

module.exports = router;
