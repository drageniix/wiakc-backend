const express = require("express");

const eventController = require("../controllers/events");
const eventMiddleware = require("../middleware/events");
const commonMiddleware = require("../middleware/common");

const router = express.Router();

router.get("/", eventController.getEvents);

router.post(
  "/",
  commonMiddleware.isAuth,
  eventMiddleware.validateEvent,
  eventController.createEvent
);

router.put(
  "/:eventId",
  commonMiddleware.isAuth,
  eventMiddleware.validateEvent,
  eventMiddleware.alterEventPermission,
  eventController.updateEvent
);

router.delete(
  "/:eventId",
  commonMiddleware.isAuth,
  eventMiddleware.alterEventPermission,
  eventController.deleteEvent
);

module.exports = router;
