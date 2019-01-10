const Post = require("../models/post");

exports.alterPost = (req, res, next) =>
  Post.findById(req.params.postId)
    .then(post => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      if (
        post.creator._id.toString() !== req.userId &&
        post.creator.privilege < 2
      ) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }
      next();
    })
    .catch(err => next(err));
