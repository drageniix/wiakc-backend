const io = require("../middleware/socket");

const Post = require("../models/post");
const User = require("../models/user");

const PER_PAGE = 2;

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const totalItems = await Post.find().countDocuments();
  const posts = await Post.find()
    .populate("creator")
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * PER_PAGE)
    .limit(PER_PAGE);

  res.status(200).json({
    message: "Fetched posts successfully.",
    posts,
    totalItems
  });
};

exports.createPost = async (req, res, next) => {
  const { title, content } = req.body;
  const post = await new Post({
    title,
    content,
    creator: req.userId
  }).save();

  const user = await User.findById(req.userId);
  user.posts.push(post);
  await user.save();

  const response = {
    message: "Post created successfully!",
    post,
    creator: { _id: user._id, name: user.name }
  };

  io.getIO().emit("posts", {
    action: "create",
    ...response
  });

  res.status(201).json(response);
};

exports.getPost = (req, res, next) =>
  Post.findById(req.params.postId)
    .populate("creator")
    .populate("comments")
    .then(post => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Post fetched.", post });
    })
    .catch(err => next(err));

exports.updatePost = (req, res, next) => {
  const { title, content } = req.body;

  Post.findById(req.params.postId)
    .populate("creator")
    .then(async post => {
      post.title = title;
      post.content = content;
      await post.save();

      const response = { message: "Post updated!", post };
      io.getIO().emit("posts", { action: "update", ...response });
      return res.status(200).json(response);
    })
    .catch(err => next(err));
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  const user = await User.findById(req.userId);

  await Post.findByIdAndRemove(postId);
  user.posts.pull(postId);
  await user.save();

  const response = { message: "Deleted post.", post: postId };
  io.getIO.emit("posts", { action: "delete", ...response });
  res.status(200).json(response);
};
