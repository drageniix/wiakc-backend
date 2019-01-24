const io = require("../middleware/socket");

const Post = require("../models/post");
const Comment = require("../models/comment");
const User = require("../models/user");

const PER_PAGE = 8;

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const query =
    (req.query.userId && { creator: req.query.userId }) || undefined;
  const totalItems = await Post.find(query).countDocuments();

  const posts = await Post.find(query)
    .populate("creator", "name flag")
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

      post = await post
        .populate({
          path: "creator",
          select: "name flag"
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
      { path: "creator", select: "name flag" },
      {
        path: "comments",
        select: "content createdAt",
        populate: { path: "creator", select: "name flag" }
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
      { path: "creator", select: "name flag" },
      {
        path: "comments",
        select: "content createdAt",
        populate: { path: "creator", select: "name flag" }
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
  try {
    const user = await User.findById(req.userId)
      .populate("comments", "creator")
      .exec();

    user.posts.pull(req.params.postId);
    user.comments = user.comments.filter(
      comment => comment.creator._id.toString() !== user._id.toString()
    );

    await Comment.deleteMany({ postId: req.params.postId }).exec();

    await Post.findOneAndDelete({ _id: req.params.postId })
      .exec()
      .then(async () => {
        await user.save();
        const response = {
          message: "Deleted post.",
          postId: req.params.postId
        };
        io.getIO().emit("posts", { action: "delete", ...response });
        res.status(200).json(response);
      });
  } catch (err) {
    console.log(err);
  }
};
