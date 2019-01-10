const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    date: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    details: {
      type: String
    },
    emphasis: {
      type: Boolean,
      default: false
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", commentSchema);
