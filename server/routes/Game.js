import express from "express";
import User from "../models/User.js";

const app = express();


const router = express.Router();

// API for saving room code
router.post("/saveRoomCode", async (req, res) => {
  const { roomCode, userId } = req.body;
  if (!roomCode || !userId) {
    return res.status(400).json({ message: "Room code and user ID are required." });
  }

  try {
    const user = await User.findOneAndUpdate(
      { username: userId },
      { currentGame: roomCode },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Room code saved successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;

