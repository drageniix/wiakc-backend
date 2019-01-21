//NOT USED. uses static images folder.

const uuidv4 = require("uuid/v4");
const multer = require("multer");

const fileStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "images");
  },
  filename: function(req, file, cb) {
    cb(null, uuidv4() + file.originalname);
  }
});

const fileFilter = (req, file, cb) =>
  cb(
    null,
    file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
  );

module.exports = multer({
  storage: fileStorage,
  fileFilter: fileFilter
}).single("image");
