const Event = require("../models/event");
const { body } = require("express-validator/check");
const commonMiddleware = require("./common");

exports.validateEvent = [
  body("title")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Event must have a title."),
  commonMiddleware.inputValidation
];

exports.alterEventPermission = (req, res, next) =>
  Event.findById(req.params.eventId)
    .then(event => {
      if (!event) {
        const error = new Error("Could not find event.");
        error.statusCode = 404;
        next(error);
      }
      if (
        event.creator._id.toString() !== req.userId &&
        event.creator.privilege < 3
      ) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        next(error);
      }
      next();
    })
    .catch(err => next(err));
