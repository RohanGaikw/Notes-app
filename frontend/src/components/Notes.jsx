import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styles/Notes.css'

const Notes = ({ user }) => {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user._id) {
      setError("User not authenticated.");
      return;
    }

    console.log("Fetching notes for user:", user._id); // Debugging

    const fetchNotes = async () => {
      if (!user?._id) {
        setError("User not authenticated.");
        return;
      }
    
      try {
        const response = await axios.get(
          `https://notes-app-pi-bice-74.vercel.app/notes?userId=${user._id}`,
          { withCredentials: true }
        );
        console.log("Received Notes:", response.data); // Debugging
        setNotes(response.data);
      } catch (err) {
        console.error("Error fetching notes:", err);
        setError(err.response?.data?.message || "An error occurred while fetching notes.");
      }
    };
    

    fetchNotes();
  }, [user]);

  const handleLogout = async () => {
    try {
      await axios.get("https://notes-app-pi-bice-74.vercel.app/logout", { withCredentials: true });
      navigate("/login");
    } catch (err) {
      setError("Error logging out. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="notes-container">
      <h2>Your Notes</h2>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>

      {error && <div className="error-message">{error}</div>}

      {notes.length > 0 ? (
        <div className="notes-list">
          {notes.map((note) => (
            <div key={note._id} className="note-item">
              <h3>{note.title}</h3>
              <p>{note.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-notes">No notes available. Start adding some!</div>
      )}
    </div>
  );
};

export default Notes;
