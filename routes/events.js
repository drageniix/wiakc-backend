const express = require("express");
const { body } = require("express-validator/check");

const eventController = require("../controllers/events");
const eventMiddleware = require("../middleware/events");
const commonMiddleware = require("../middleware/common");

const router = express.Router();

router.get("/", eventController.getEvents);

router.post(
  "/",
  commonMiddleware.isAuth,
  [
    body("title")
      .trim()
      .isLength({ min: 3 })
  ],
  commonMiddleware.inputValidation,
  eventController.createEvent
);

router.put(
  "/:eventId",
  commonMiddleware.isAuth,
  [
    body("title")
      .trim()
      .isLength({ min: 3 })
  ],
  commonMiddleware.inputValidation,
  eventMiddleware.alterEvent,
  eventController.updateEvent
);

router.delete(
  "/:eventId",
  commonMiddleware.isAuth,
  eventMiddleware.alterEvent,
  eventController.deleteEvent
);

module.exports = router;
