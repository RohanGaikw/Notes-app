import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css"; // Make sure to link the correct CSS file

function Register({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Both fields are required.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/register", {
        username,
        password,
      });
      console.log(response.data);

      setError("");
      setUsername("");
      setPassword("");

      navigate("/login"); // Redirect to login after successful registration
    } catch (error) {
      console.error("Registration failed:", error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="register-page">
      <div className="login-form">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Register</button>
        </form>
        {error && <p>{error}</p>}
      </div>
    </div>
  );
}

export default Register;
