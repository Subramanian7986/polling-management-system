const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  title: { type: String, required: true },
  candidates: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true }
  ],
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Track voters (users who voted)
  published: { type: Boolean, default: false },
});

const Poll = mongoose.model("Poll", pollSchema);
module.exports = Poll;
