require("dotenv").config();

const path = require("path");

const authRoutes = require("./routes/auth");
const feedRoutes = require("./routes/feed");
const eventRoutes = require("./routes/events");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const socket = require("./middleware/socket");

const app = express();

app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/auth", authRoutes);
app.use("/calendar", eventRoutes);
app.use("/feed", feedRoutes);

app.use((error, req, res, next) =>
  res.status(error.statusCode || 500).json({
    message: error.message,
    data: error.data
  })
);

mongoose
  .connect(
    process.env.MONGODB_URI,
    { useNewUrlParser: true }
  )
  .then(() => {
    const server = app.listen(process.env.PORT || 5000);
    socket.init(server);
  })
  .catch(err => console.log(err));
