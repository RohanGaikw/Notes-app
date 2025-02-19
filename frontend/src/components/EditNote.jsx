import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditNote = () => {
  const { id } = useParams();  // Access the dynamic note ID from the URL
  const [note, setNote] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/notes/${id}`);
        setNote(response.data);  // Assuming response has { title, description }
      } catch (err) {
        setError('Error fetching note.');
      }
    };

    fetchNote();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNote({ ...note, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Check if the update function is available before calling
      const updateNote = async () => {
        try {
          const response = await axios.put(
            `http://localhost:5000/notes/${id}`,  // Correct URL
            { title: note.title, description: note.description },
            { withCredentials: true }
          );
          console.log("Note updated successfully:", response.data);
          navigate('/notes');  // Redirect to notes page after update
        } catch (err) {
          console.error("Error updating note:", err);
          setError("Failed to update note.");
        }
      };

      // Check if the function exists
      if (typeof updateNote === 'function') {
        updateNote();  // Call if it's a function
      } else {
        console.error("updateNote is not a function");
      }
    } catch (err) {
      console.error("Error handling submit:", err);
      setError("Error handling the form submission.");
    }
  };

  return (
    <div>
      <h2>Edit Note</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          value={note.title}
          onChange={handleChange}
          placeholder="Title"
        />
        <textarea
          name="description"
          value={note.description}
          onChange={handleChange}
          placeholder="Description"
        />
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default EditNote;
