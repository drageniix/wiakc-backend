const Comment = require("../models/comment");

exports.alterComment = (req, res, next) =>
  Comment.findById(req.params.commentId)
    .then(comment => {
      if (!comment) {
        const error = new Error("Could not find comment.");
        error.statusCode = 404;
        throw error;
      }
      if (
        comment.creator._id.toString() !== req.userId &&
        comment.creator.privilege < 3
      ) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }
      next();
    })
    .catch(err => next(err));
