//NOT USED. uses static images folder.

const multer = require("multer");

const fileFilter = (req, file, cb) =>
  cb(
    null,
    file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/webp" ||
      file.mimetype === "image/tiff" ||
      file.mimetype === "image/svg+xml"
  );

module.exports = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter
}).single("image");
