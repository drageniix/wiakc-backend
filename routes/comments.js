const express = require("express");
const { body } = require("express-validator/check");

const commonMiddleware = require("../middleware/common");
const commentMiddleware = require("../middleware/comments");
const commentController = require("../controllers/comments");

const router = express.Router({ mergeParams: true });

router.post(
  "/",
  commonMiddleware.isAuth,
  [
    body("content")
      .trim()
      .isLength({ min: 2 })
  ],
  commonMiddleware.inputValidation,
  commentController.postComment
);

router.put(
  "/:commentId",
  commonMiddleware.isAuth,
  [
    body("content")
      .trim()
      .isLength({ min: 2 })
  ],
  commonMiddleware.inputValidation,
  commentMiddleware.alterComment,
  commentController.updateComment
);

router.delete(
  "/:commentId",
  commonMiddleware.isAuth,
  commentMiddleware.alterComment,
  commentController.deleteComment
);

module.exports = router;
