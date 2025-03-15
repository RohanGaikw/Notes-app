require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const expressSession = require("express-session");
const cors = require("cors");
const app = express();
const path = require('path');


const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173", // Update to match the frontend URL (Vite dev server)
  methods: "GET, POST, PUT, DELETE",
  credentials: true, // Allow cookies and sessions to be sent
};

app.use(cors(corsOptions));
app.use(express.json()); // For parsing application/json
app.use(express.static(path.join(__dirname, 'public')));


// Setup Express Session
app.use(expressSession({
  secret: process.env.SESSION_SECRET || "yourSecretKey",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false, sameSite: "lax" },
}));

app.use(passport.initialize());
app.use(passport.session());


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
}).catch(err => {
  console.error("MongoDB Connection Error:", err);
});
// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

// Note Schema
const NoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
});

const Note = mongoose.model("Note", NoteSchema);

// Passport Strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return done(null, false, { message: "Incorrect username" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: "Incorrect password" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Serialize & Deserialize User
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Register User
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
});

// Login User
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message || "Authentication failed" });

    req.login(user, (err) => {
      if (err) return next(err);
      return res.json({ message: "Login successful", user });
    });
  })(req, res, next);
});

// Fetch Notes
app.get("/notes", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const notes = await Note.find({ userId: req.user._id });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});


// Add Note
app.post("/add-note", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newNote = new Note({ userId: req.user._id, title, description });
    await newNote.save();
    res.json({ message: "Note added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});


// Logout
app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Error destroying session" });
      res.json({ message: "Successfully logged out" });
    });
  });
});


// Global Error Handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// Start Server
app.listen(PORT, () => {

  console.log(`Server is running on port ${port}`);
});

module.exports = app;