const io = require("../middleware/socket");

const Post = require("../models/post");
const User = require("../models/user");

const PER_PAGE = 8;

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const totalItems = await Post.find().countDocuments();

  const posts = await Post.find()
    .populate("creator", "name country")
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * PER_PAGE)
    .limit(PER_PAGE);

  res.status(200).json({
    message: "Fetched posts.",
    posts,
    totalItems,
    itemsPerPage: PER_PAGE
  });
};

exports.createPost = (req, res, next) =>
  new Post({
    title: req.body.title,
    content: req.body.content,
    creator: req.userId
  })
    .save()
    .then(async post => {
      const user = await User.findById(req.userId);
      user.posts.push(post._id);
      await user.save();

      const post = await post
        .populate({
          path: "creator",
          select: "name country"
        })
        .execPopulate();

      const response = {
        message: "Created post.",
        post,
        creator: { _id: user._id, name: user.name }
      };

      io.getIO().emit("posts", {
        action: "create",
        ...response
      });

      res.status(201).json(response);
    })
    .catch(err => next(err));

exports.getPost = (req, res, next) =>
  Post.findById(req.params.postId)
    .populate([
      { path: "creator", select: "name country" },
      {
        path: "comments",
        select: "content createdAt",
        populate: { path: "creator", select: "name country" }
      }
    ])
    .then(post => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Fetched post.", post });
    })
    .catch(err => next(err));

exports.updatePost = (req, res, next) => {
  const { title, content } = req.body;

  Post.findOneAndUpdate(
    { _id: req.params.postId },
    { $set: { title, content } },
    { new: true }
  )
    .populate([
      { path: "creator", select: "name country" },
      {
        path: "comments",
        select: "content createdAt",
        populate: { path: "creator", select: "name country" }
      }
    ])
    .exec()
    .then(post => {
      const response = { message: "Updated post.", post };
      io.getIO().emit("posts", {
        action: "update",
        ...response
      });
      return res.status(200).json(response);
    })
    .catch(err => next(err));
};

exports.deletePost = async (req, res, next) => {
  const user = await User.findById(req.userId);
  user.posts.pull(req.params.postId);

  Post.findOneAndDelete({ _id: req.params.postId })
    .exec()
    .then(async () => {
      await user.save();
      const response = { message: "Deleted post.", post: req.params.postId };
      io.getIO().emit("posts", { action: "delete", ...response });
      res.status(200).json(response);
    })
    .catch(err => next(err));
};
