const Event = require("../models/event");

exports.alterEvent = (req, res, next) =>
  Event.findById(req.params.eventId)
    .then(event => {
      if (!event) {
        const error = new Error("Could not find event.");
        error.statusCode = 404;
        throw error;
      }
      if (
        event.creator._id.toString() !== req.userId &&
        event.creator.privilege < 3
      ) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }
      next();
    })
    .catch(err => next(err));
