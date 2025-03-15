import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Notes from "./components/Notes";
import AddNote from "./components/AddNote";
import EditNote from "./components/EditNote"; // Import EditNote component
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const PrivateRoute = ({ user, children }) => {
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark p-3 animate__animated animate__fadeIn">
        <div className="container">
          <Link className="navbar-brand" to="/">Notes App</Link>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ml-auto">
              {user ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/notes">Notes</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/add-note">Add Note</Link>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-danger" onClick={() => { localStorage.removeItem("user"); setUser(null); }}>Logout</button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register">Register</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">Login</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <div className="container mt-4 animate__animated animate__fadeIn">
        <Routes>
          <Route path="/" element={
            <div className="welcome-message">
              <h1>Welcome to the Web Page</h1>
              <p>Your Notes App is just a few clicks away. Please log in or register to start.</p>
            </div>
          } />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/notes" element={<PrivateRoute user={user}><Notes user={user} /></PrivateRoute>} />
          <Route path="/add-note" element={<PrivateRoute user={user}><AddNote user={user} /></PrivateRoute>} />
          <Route path="/edit-note/:id" element={<PrivateRoute user={user}><EditNote user={user} />
          </PrivateRoute>} /> {/* Add this route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
