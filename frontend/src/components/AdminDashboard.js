import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [polls, setPolls] = useState([]);
  const [title, setTitle] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [newCandidateName, setNewCandidateName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
    fetchPolls();
  }, []);

  const fetchCandidates = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/candidates");
    setCandidates(res.data);
  };

  const fetchPolls = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/polls");
      setPolls(response.data);
    } catch (error) {
      console.error("Error fetching polls:", error);
    }
  };

  const handleAddCandidate = async () => {
    const name = prompt("Enter candidate name:");
    if (name) {
      await axios.post("http://localhost:5000/api/admin/add-candidate", { name });
      fetchCandidates(); // refresh candidate list
    }
  };


  const handleCreatePoll = async () => {
    if (!title || selectedCandidates.length === 0) {
      alert("Please provide a title and select candidates");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/admin/create-poll", {
        title,
        candidateIds: selectedCandidates, // Array of candidate IDs
      });
      fetchPolls(); // Refresh polls
    } catch (error) {
      console.error("Error creating poll:", error);
      alert("Failed to create poll");
    }
  };
  
 

  const handleCandidateSelection = (candidateId) => {
    setSelectedCandidates((prevSelected) =>
      prevSelected.includes(candidateId)
        ? prevSelected.filter((id) => id !== candidateId) // unselect if already selected
        : [...prevSelected, candidateId] // add candidate if not selected
    );
  };

  const handlePublishPoll = async (pollId) => {
    await axios.post(`http://localhost:5000/api/admin/polls/${pollId}/publish`);
    fetchPolls(); // refresh polls
  };

  const handleDeleteCandidate = async (candidateId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/delete-candidate/${candidateId}`);
      fetchCandidates(); // refresh candidates list
    } catch (error) {
      console.error("Error deleting candidate:", error);
      alert("Failed to delete candidate");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/"); // Redirect to login page after logout
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>

      <h3>Add Candidate</h3>
      <button onClick={handleAddCandidate}>Add Candidate</button>

      <h3>Create Poll</h3>
      <input
        type="text"
        placeholder="Poll Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <h4>Select Candidates for Poll</h4>
      {candidates.map((candidate) => (
        <div key={candidate._id}>
          <label>
            <input
              type="checkbox"
              checked={selectedCandidates.includes(candidate._id)}
              onChange={() => handleCandidateSelection(candidate._id)}
            />
            {candidate.name}
          </label>
          <button onClick={() => handleDeleteCandidate(candidate._id)}>Delete</button>
        </div>
      ))}
      <button onClick={handleCreatePoll}>Create Poll</button>

      <h3>Manage Polls</h3>
      {polls.map((poll) => (
        <div key={poll._id}>
          <h4>{poll.title}</h4>
          <button onClick={() => handlePublishPoll(poll._id)} disabled={poll.published}>
            {poll.published ? "Published" : "Publish Poll"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
