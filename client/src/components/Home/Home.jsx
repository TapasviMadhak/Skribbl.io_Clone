import React, { useState } from "react";
import "./Home.css";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

const Home = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [roomCode, setRoomCode] = useState("");
  const userId = localStorage.getItem("userId"); // Retrieve userId from localStorage
  
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const generatedRoomCode = generateRoomCode(); // Generate the room code
    setRoomCode(generatedRoomCode); // Update local state (optional)
    navigate("/home/createRoom", { state: { roomCode: generatedRoomCode } }); // Pass roomCode via state
  };

  function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const handleJoinRoom = async () => {
    if (!roomCode || !userId) {
      alert("Please enter a room code and ensure you're logged in!");
      return;
    }

    try {

      socket.on("connect", () => {
        console.log("Connected to socket server with ID:", socket.id);
      });
      // Emit joinRoom event to the server
      socket.emit("joinRoom", { roomCode, userId });

      // Save the room code to the database
      const response = await fetch("http://localhost:5000/api/game/saveRoomCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to save room code");
      }

      const data = await response.json();
      console.log("Room joined and saved successfully:", data);

      // Navigate to the game room (replace with your navigation logic)
      navigate(`/home/waitingRoom`, { state: { roomCode, userId } });
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Unable to join the room. Please check the room code and try again.");
    }
  };

  return (
    <div className="home-wrapper">
       <div className="title">Welcome to skribbl.io</div>
      <div className="home-container">
     
        <div className="main-content">
          <form onSubmit={handleSubmit(handleJoinRoom)}>
            <div className="container-home">
             

              <button onClick={handleCreateRoom} className="button-home">Create Room</button>

              <label htmlFor="roomCode">Enter room code:</label>
              <input
                type="text"
                {...register("roomCode", { required: true, maxLength: 6 })}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="input"
              
              />
              {errors.roomCode && <p className="error">Please enter a room code!</p>}
              <button type="submit" className="button-home">Join Room</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;

