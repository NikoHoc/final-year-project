const express = require("express");
const cors = require("cors");

// routes
const authRoutes = require('./routes/authRoutes');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// base route
app.get("/", (req, res) => {
  res.send({
    status: "success",
    message: "Backend Server is Running...",
    timestamp: new Date(),
  });
});

// routes
app.use('/api/v1/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: "Route not found",
  });
});

module.exports = app;
