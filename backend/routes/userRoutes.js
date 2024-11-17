const express = require("express");
const jwt = require("jsonwebtoken");
const Poll = require("../models/Poll");
const User = require("../models/User");
const Vote = require("../models/Vote");
const router = express.Router();

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.log("Missing token");
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err) {
      console.log("Invalid token");
      return res.status(403).json({ message: "Invalid token" });
    }
    console.log("Decoded User:", decoded);
    req.user = decoded;
    next();
  });
};


// In your userRoutes.js or wherever the poll route is defined
router.get("/polls", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetching the polls with populated candidate names
    const polls = await Poll.find()
      .populate({
        path: 'candidates', 
        select: 'name',  // Only populate the name field of the candidate
      })
      .lean();  // `lean` gives you plain JavaScript objects, instead of Mongoose documents

    // Map polls to include information about whether the user has voted
    const pollsWithVotingInfo = polls.map((poll) => ({
      ...poll,
      hasVoted: poll.voters && poll.voters.includes(userId), // Ensure there's a `voters` field in your schema
    }));

    res.json(pollsWithVotingInfo);
  } catch (err) {
    console.error("Error fetching polls:", err);
    res.status(500).json({ message: "Error fetching polls" });
  }
});



router.post("/vote/:pollId", authenticateUser, async (req, res) => {
  try {
    const { pollId } = req.params;
    const { candidateId } = req.body;
    const userId = req.user.id;

    // Validate the poll exists
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    // Validate the candidate belongs to the poll
    const candidate = poll.candidates.find((c) => c._id.toString() === candidateId);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    // Ensure the user hasn't already voted for this poll
    const existingVote = await Vote.findOne({ pollId, userId });
    if (existingVote) {
      return res.status(400).json({ message: "You have already voted for this poll." });
    }

    // Save the vote in the Vote collection
    const vote = new Vote({ pollId, candidateId, userId });
    await vote.save();

    res.status(200).json({ message: "Vote cast successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// In your routes file
// Updated route to get published polls with winner information
router.get("/polls/results", authenticateUser, async (req, res) => {
  try {
    const polls = await Poll.find({ published: true })
      .populate("candidates", "name") // Populate candidate names
      .lean();

    const pollsWithResults = await Promise.all(
      polls.map(async (poll) => {
        // Count votes for each candidate
        const voteCounts = await Vote.aggregate([
          { $match: { pollId: poll._id } }, // Filter votes for the current poll
          { $group: { _id: "$candidateId", count: { $sum: 1 } } }, // Count votes for each candidate
        ]);

        // Map aggregated votes back to candidates and determine the winner
        let winner = null;
        let maxVotes = -1;

        const candidateVotes = poll.candidates.map((candidate) => {
          const vote = voteCounts.find(
            (v) => v._id.toString() === candidate._id.toString()
          );
          const voteCount = vote ? vote.count : 0;

          // Update winner if this candidate has more votes
          if (voteCount > maxVotes) {
            maxVotes = voteCount;
            winner = candidate.name;
          }

          return {
            candidateName: candidate.name,
            voteCount,
          };
        });

        return {
          title: poll.title,
          results: candidateVotes,
          winner: winner ? `${winner} with ${maxVotes} votes` : "No votes yet", // Winner or fallback text
        };
      })
    );

    res.json(pollsWithResults);
  } catch (err) {
    console.error("Error fetching published poll results:", err);
    res.status(500).json({ message: "Error fetching results" });
  }
});


module.exports = router;
