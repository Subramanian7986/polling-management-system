const express = require("express");
const Candidate = require("../models/Candidate");
const Poll = require("../models/Poll");
const Vote = require("../models/Vote");
const authenticateAdmin = require("../middlewares/authenticateAdmin");
const router = express.Router();


router.get('/polls', async (req, res) => {
    try {
      const polls = await Poll.find();  // Adjust this based on your database and schema
      res.json(polls);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching polls' });
    }
  });
// Add Candidate
router.post("/add-candidate", async (req, res) => {
  try {
    const { name } = req.body;
    const newCandidate = await Candidate.create({ name });
    res.status(201).json(newCandidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Candidate
router.delete("/delete-candidate/:id", async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Candidate deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/candidates", async (req, res) => {
    try {
      const candidates = await Candidate.find();
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ message: "Error fetching candidates" });
    }
  });
  
// Publish Poll
router.post("/polls/:id/publish", async (req, res) => {
    try {
      const poll = await Poll.findById(req.params.id);
      if (!poll) return res.status(404).json({ error: "Poll not found" });
  
      poll.published = true;
      await poll.save();
      res.status(200).json({ message: "Poll published successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
// Create Poll Endpoint
router.post("/create-poll", async (req, res) => {
  try {
    const { title, candidateIds } = req.body;

    // Ensure title and candidateIds are provided
    if (!title || !candidateIds || candidateIds.length === 0) {
      return res.status(400).json({ error: "Title and candidates are required" });
    }

    // Ensure all candidateIds exist in the database
    const candidates = await Candidate.find({ _id: { $in: candidateIds } });
    if (candidates.length !== candidateIds.length) {
      return res.status(400).json({ error: "Some candidates do not exist" });
    }

    // Create the poll with candidate IDs
    const newPoll = new Poll({ title, candidates: candidateIds });
    await newPoll.save();

    res.status(201).json(newPoll);
  } catch (err) {
    console.error("Error creating poll:", err);
    res.status(500).json({ error: err.message });
  }
});



router.get("/polls/:pollId/votes", authenticateAdmin, async (req, res) => {
  try {
    const { pollId } = req.params;

    const votes = await Vote.aggregate([
      { $match: { pollId: mongoose.Types.ObjectId(pollId) } },
      {
        $group: {
          _id: "$candidateId",
          voteCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "polls",
          localField: "_id",
          foreignField: "candidates._id",
          as: "candidateDetails",
        },
      },
    ]);

    res.status(200).json(votes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});  

// Publish Poll
router.patch("/publish-poll/:id", async (req, res) => {
  try {
    await Poll.findByIdAndUpdate(req.params.id, { published: true });
    res.status(200).json({ message: "Poll published" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
