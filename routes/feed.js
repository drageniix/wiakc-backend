const express = require("express");

const commentRoutes = require("./comments");

const feedController = require("../controllers/feed");
const feedMiddleware = require("../middleware/feed");
const commonMiddleware = require("../middleware/common");

const router = express.Router();

router.get("/posts", feedController.getPosts);

router.post(
  "/post",
  commonMiddleware.isAuth,
  feedMiddleware.validatePost,
  feedController.createPost
);

router.get("/post/:postId", feedController.getPost);

router.put(
  "/post/:postId",
  commonMiddleware.isAuth,
  feedMiddleware.validatePost,
  feedMiddleware.alterPostPermission,
  feedController.updatePost
);

router.delete(
  "/post/:postId",
  commonMiddleware.isAuth,
  feedMiddleware.alterPostPermission,
  feedController.deletePost
);

router.use("/post/:postId/comments", commentRoutes);

module.exports = router;
