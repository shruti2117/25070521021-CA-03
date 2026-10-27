const Project = require("./project");
const Application = require("./Application");
const ContactMessage = require("./ContactMessage");
const User = require("./User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();


const app = express();

app.use(cors());
app.use(express.json());


function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Please log in to perform this action.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Your login session is invalid or expired. Please log in again.",
    });
  }
}


// Test the server
app.get("/", (req, res) => {
  res.send("ProjectPulse server is running!");
});

// Get all projects from MongoDB
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch projects" });
  }
});

// Create and save a project in MongoDB
app.post("/api/projects", authenticateToken, async (req, res) => {
  try {
    const { title, category, description, skills } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Project title and description are required",
      });
    }

    
const project = await Project.create({
  title,
  category,
  description,
  skills: Array.isArray(skills) ? skills : [],
  owner: req.userId,
});


    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Could not create project" });
  }
});


app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          "Enter your name, email, and a password of at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    console.error("Signup error:", error.message);
    res.status(500).json({
      message: "Could not create account.",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please enter your email and password.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      message: "Could not log in. Please try again.",
    });
  }
});

// Connect to MongoDB and start the server

 // Get all applications
app.get("/api/applications", authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find().sort({
      createdAt: -1,
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({
      message: "Could not fetch applications",
    });
  }
});

// Submit an application to join a project
app.post("/api/applications", authenticateToken, async (req, res) => {
  try {
    const { projectId, projectTitle, applicantName, message } = req.body;

    if (!projectId || !projectTitle) {
      return res.status(400).json({
        message: "Project ID and title are required",
      });
    }

    
    const application = await Application.create({
        projectId,
        projectTitle,
        applicantName,
        applicantId: req.userId,
        message,
    });


    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({
      message: "Could not submit application",
    });
  }
});


mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/projectpulse"
  )
  .then(() => {
    console.log("MongoDB connected successfully");

    
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !subject.trim() ||
      !message.trim()
    ) {
      return res.status(400).json({
        message: "Please fill in all contact form fields.",
      });
    }

    if (
      name.trim().length > 100 ||
      email.trim().length > 254 ||
      subject.trim().length > 150 ||
      message.trim().length > 5000
    ) {
      return res.status(400).json({
        message: "One or more fields are too long.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const savedMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      message: "Your message was saved successfully!",
      id: savedMessage._id,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({
      message: "Could not save your message. Please try again.",
    });
  }
});


    app.listen(5000, () => {
      console.log("Server running on http://localhost:5000");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
