import React, { useState } from "react";
import axios from "axios";
import "../styles/AddNote.css"; // Make sure to link the correct CSS file

const AddNote = ({ user }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user?._id) {
      setError("User not authenticated.");
      return;
    }
    if (!title || !description) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://notes-app-pi-bice-74.vercel.app/add-note",
        { userId: user._id, title, description },
        { withCredentials: true }
      );
      setSuccess(response.data.message);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err.response?.data?.message || "Error adding note.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-note-container">
      <h2>Add a New Note</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Note"}
        </button>
      </form>
    </div>
  );
};

export default AddNote;
