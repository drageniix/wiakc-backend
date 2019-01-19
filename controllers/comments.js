const io = require("../middleware/socket");

const Comment = require("../models/comment");
const Post = require("../models/post");
const User = require("../models/user");

exports.postComment = (req, res, next) => {
  const { content } = req.body;

  new Comment({ content, creator: req.userId })
    .save()
    .then(async comment => {
      await Post.findById(req.params.postId).then(post => {
        post.comments.push(comment._id);
        return post.save();
      });

      await User.findById(req.userId).then(user => {
        user.comments.push(comment._id);
        return user.save();
      });

      const response = {
        message: "Created comment.",
        comment
      };

      io.getIO().emit("comments", {
        action: "create",
        ...response
      });

      res.status(201).json(response);
    })
    .catch(err => next(err));
};

exports.updateComment = (req, res, next) => {
  const { content } = req.body;

  Comment.findOneAndUpdate({ _id: req.params.commentId }, { $set: { content } })
    .then(() => {
      const response = {
        message: "Updated comment.",
        comment: req.params.commentId
      };

      io.getIO().emit("comments", {
        action: "update",
        ...response
      });

      return res.status(200).json(response);
    })
    .catch(err => next(err));
};

exports.deleteComment = async (req, res, next) => {
  const user = await User.findById(req.userId);
  user.comments.pull(req.params.commentId);

  const post = await Post.findById(req.params.postId);
  post.comments.pull(req.params.commentId);

  Comment.findOneAndDelete({ _id: req.params.commentId })
    .then(async () => {
      await user.save();
      await post.save();

      const response = {
        message: "Deleted comment.",
        comment: req.params.commentId
      };

      io.getIO().emit("comments", {
        action: "delete",
        ...response
      });

      return res.status(200).json(response);
    })
    .catch(err => next(err));
};
