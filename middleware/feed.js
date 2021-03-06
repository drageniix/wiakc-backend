const Post = require("../models/post");
const { body } = require("express-validator/check");
const commonMiddleware = require("./common");

exports.validatePost = [
  body("title")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter a title."),
  body("content")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter some text."),
  commonMiddleware.inputValidation
];

exports.alterPostPermission = (req, res, next) =>
  Post.findById(req.params.postId)
    .then(post => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        next(error);
      }
      if (
        post.creator._id.toString() !== req.userId &&
        post.creator.privilege < 2
      ) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        next(error);
      }
      next();
    })
    .catch(err => next(err));
