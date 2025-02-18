import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import gameRoutes from './routes/Game.js';
import socket from "./routes/socket.js";
import http from "http";

import dbConfig from "./config/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app); // Use this server for both HTTP and WebSocket

// Initialize Socket.io
socket(server); // Pass the HTTP server to the socket function

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(dbConfig.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

// Routes
app.use("/api/auth", authRoutes); // For authentication-related routes
app.use("/api/game", gameRoutes); // For game-related routes

// Start Server
const startServer = async () => {
  await connectDB();
  server.listen(port, () => console.log(`Server listening on port ${port}`)); // Listen with the HTTP server
};

startServer();
