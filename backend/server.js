require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const expressSession = require("express-session");
const cors = require("cors");


const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5174", // Update to match the frontend URL (Vite dev server)
  methods: "GET, POST, PUT, DELETE",
  credentials: true, // Allow cookies and sessions to be sent
};

app.use(cors(corsOptions));
app.use(express.json()); // For parsing application/json
app.use(express.static('public'));


// Setup Express Session
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET || "yourSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, sameSite: "lax" },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process on connection error
  });
// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

// Note Schema (linked to User)
const NoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user
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
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });

    console.log(`Registering user: ${username}`); // Debugging log

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error registering user:", err.message); // Error logging
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
app.get('/hybridaction/zybTrackerStatisticsAction', (req, res) => {
  // Handle the request here
  res.json({ message: 'Statistics data' });
});


// Fetch Notes (Only for logged-in users)
app.get('/notes', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'UserId is required' });
  }
  try {
    const notes = await Note.find({ userId });
    res.status(200).json(notes); // Return notes array directly
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});


app.get('/notes/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

app.post('/notes', (req, res) => {
  const { userId, title, description } = req.body;
  if (!userId || !title || !description) {
    return res.status(400).send({ error: 'UserId, Title, and Description are required' });
  }

  // Insert the new note in the database
  db.collection('notes').insertOne({ userId, title, description }, (err, result) => {
    if (err) {
      return res.status(500).send({ error: 'Failed to create note' });
    }
    res.status(201).send({ message: 'Note created successfully', noteId: result.insertedId });
  });
});

// Add Note (Linked to User)
app.post("/add-note", async (req, res) => {
  try {
      console.log("Received Data:", req.body);  // Debugging log

      const { userId, title, description } = req.body;
      if (!userId || !title || !description) {
          return res.status(400).json({ success: false, message: "All fields are required" });
      }

      const newNote = new Note({ userId, title, description });
      await newNote.save();

      res.json({ success: true, message: "Note added successfully" });
  } catch (error) {
      console.error("Error adding note:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Error logging out" });

    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Error destroying session" });

      res.json({ message: "Successfully logged out" });
    });
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)); 