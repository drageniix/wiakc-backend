const express = require("express");
const { body } = require("express-validator/check");

const eventController = require("../controllers/events");
const eventMiddleware = require("../middleware/events");
const commonMiddleware = require("../middleware/common");

const router = express.Router();

router.get("/events", eventController.getEvents);

router.post(
  "/event",
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
  "/event/:eventId",
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
  "/event/:eventId",
  commonMiddleware.isAuth,
  eventMiddleware.alterEvent,
  eventController.deleteEvent
);

module.exports = router;
