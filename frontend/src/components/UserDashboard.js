import React, { useEffect, useState } from "react";
import axios from "axios";

const UserDashboard = () => {
  const [polls, setPolls] = useState([]);
  const [publishedPolls, setPublishedPolls] = useState([]); // State for published polls
  const [username, setUsername] = useState(localStorage.getItem("username") || "Guest");
  const [votedPolls, setVotedPolls] = useState(new Set());
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    fetchPolls();
    fetchPublishedPollResults();  // Fetch published polls and results
  }, []);

  const fetchPolls = async () => {
    setLoading(true); // Set loading to true while fetching
    try {
      const res = await axios.get("http://localhost:5000/api/user/polls", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const votedIds = new Set(res.data.filter((poll) => poll.hasVoted).map((poll) => poll._id));
      setPolls(res.data);
      setVotedPolls(votedIds);
    } catch (err) {
      console.error("Error fetching polls:", err);
    } finally {
      setLoading(false); // Set loading to false after data is fetched
    }
  };

  const fetchPublishedPollResults = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/user/polls/results", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPublishedPolls(res.data);  // Set the published polls with results
    } catch (err) {
      console.error("Error fetching published poll results:", err);
    }
  };

  const handleVote = async (pollId, candidateId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/user/vote/${pollId}`,
        { candidateId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Vote cast successfully!");
      fetchPolls(); // Refresh the polls to reflect updated voting information
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.message);
      } else {
        console.error("Error casting vote:", err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    alert("Logged out successfully!");
    window.location.reload();
  };

  return (
    <div>
      <h2>Welcome, {username}!</h2>
      <button onClick={handleLogout}>Logout</button>
      <h3>Available Polls</h3>
      {loading ? (
        <p>Loading...</p> // Show loading message while fetching data
      ) : polls.length === 0 ? (
        <p>No polls available</p>
      ) : (
        polls.map((poll) => (
          <div key={poll._id}>
            <h4>{poll.title}</h4>
            {poll.candidates.map((candidate) => (
              <button
                key={candidate._id}
                onClick={() => handleVote(poll._id, candidate._id)}
                disabled={votedPolls.has(poll._id)}
              >
                {candidate.name}
              </button>
            ))}
          </div>
        ))
      )}

<h3>Published Poll Results</h3>
{publishedPolls.length === 0 ? (
  <p>No published polls yet.</p>
) : (
  publishedPolls.map((poll) => (
    <div key={poll.title}>
      <h4>{poll.title}</h4>
      <p><strong>Winner:</strong> {poll.winner}</p>
      <ul>
        {poll.results.map((result, index) => (
          <li key={index}>
            {result.candidateName}: {result.voteCount} votes
          </li>
        ))}
      </ul>
    </div>
  ))
)}

    </div>
  );
};

export default UserDashboard;
