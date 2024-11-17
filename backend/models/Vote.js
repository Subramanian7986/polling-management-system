const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  pollId: { type: mongoose.Schema.Types.ObjectId, ref: "Poll", required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

voteSchema.index({ pollId: 1, userId: 1 }, { unique: true }); // Ensure a user votes only once per poll

const Vote = mongoose.model("Vote", voteSchema);
module.exports = Vote;
