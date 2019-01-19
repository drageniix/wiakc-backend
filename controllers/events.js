const io = require("../middleware/socket");
const Event = require("../models/event");

const PER_PAGE = 20;

exports.getEvents = async (req, res, next) => {
  const totalItems = await Event.find().countDocuments();
  const currentPage = req.query.page || 1;

  Event.find({
    date: {
      $gte: 1546300800,
      $lt: 1577836800
    }
  })
    .sort({ date: 1 })
    .skip((currentPage - 1) * PER_PAGE)
    .limit(PER_PAGE)
    .then(events => {
      res.status(200).json({
        message: "Fetched events successfully.",
        events,
        totalItems
      });
    })
    .catch(err => next(err));
};

exports.createEvent = (req, res, next) => {
  const { date, title, details, emphasis } = req.body;

  new Event({
    date,
    title,
    details,
    emphasis,
    creator: req.userId
  })
    .save()
    .then(event => {
      const response = {
        message: "Created event.",
        event
      };

      io.getIO().emit("events", {
        action: "create",
        ...response
      });

      res.status(201).json(response);
    })
    .catch(err => next(err));
};

exports.updateEvent = (req, res, next) => {
  const { date, title, details, emphasis } = req.body;

  Event.findOneAndUpdate(
    { id_: req.params.eventId },
    {
      $set: {
        date,
        emphasis,
        title,
        details
      }
    },
    { new: true }
  )
    .then(() => {
      const response = {
        message: "Updated event.",
        event: req.params.eventId
      };

      io.getIO().emit("events", { action: "update", ...response });
      return res.status(200).json(response);
    })
    .catch(err => next(err));
};

exports.deleteEvent = (req, res, next) =>
  Event.findOneAndDelete({ id_: req.params.eventId })
    .then(() => {
      const response = {
        message: "Deleted event.",
        event: req.params.eventId
      };

      io.getIO().emit("events", { action: "delete", ...response });
      res.status(200).json(response);
    })
    .catch(err => next(err));
