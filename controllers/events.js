const io = require("../middleware/socket");
const Event = require("../models/event");

const PER_PAGE = 20;

exports.getEvents = async (req, res, next) => {
  const totalItems = await Event.find().countDocuments();

  const events = await getAllEvents(req);
  res.status(200).json({
    message: "Fetched events successfully.",
    events,
    totalItems
  });
};

exports.createEvent = async (req, res, next) => {
  const { date, title, details, emphasis } = req.body;

  await new Event({
    date,
    title,
    details,
    emphasis,
    creator: req.userId
  }).save();

  const events = await getAllEvents(req);
  const response = {
    message: "Event created successfully!",
    events
  };

  io.getIO().emit("events", {
    action: "create",
    ...response
  });

  res.status(201).json(response);
};

exports.getEvent = (req, res, next) =>
  Event.findById(req.params.eventId)
    .then(event => {
      if (!event) {
        const error = new Error("Could not find event.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Event fetched.", event });
    })
    .catch(err => next(err));

exports.updateEvent = (req, res, next) => {
  const { date, title, details, emphasis } = req.body;

  Event.findById(req.params.eventId)
    .then(async event => {
      event.date = date;
      event.emphasis = emphasis;
      event.title = title;
      event.details = details;
      await event.save();

      const events = await getAllEvents(req);
      const response = {
        message: "Event updated!",
        events
      };

      io.getIO().emit("events", { action: "update", ...response });
      return res.status(200).json(response);
    })
    .catch(err => next(err));
};

exports.deleteEvent = async (req, res, next) => {
  await Event.findOneAndDelete({ _id: req.params.eventId });

  const events = await getAllEvents(req);
  const response = {
    message: "Deleted event.",
    events
  };

  io.getIO().emit("events", { action: "delete", ...response });
  res.status(200).json(response);
};

async function getAllEvents(req) {
  const currentPage = req.query.page || 1;
  return Event.find({
    date: {
      $gte: 1546300800,
      $lt: 1577836800
    }
  })
    .sort({ date: 1 })
    .skip((currentPage - 1) * PER_PAGE)
    .limit(PER_PAGE);
}
