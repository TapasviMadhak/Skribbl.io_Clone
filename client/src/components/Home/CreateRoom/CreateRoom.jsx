import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CreateRoom.css";
import socket from "../../socket";

const CreateRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const roomCode = location.state?.roomCode;
  const userId = localStorage.getItem("userId"); // Retrieve userId from localStorage

  const [roomDetails, setRoomDetails] = useState({
    players: 8,
    drawTime: 80,
    rounds: 3,
    wordCount: 3,
    hints: 2,
  });
  const [players, setPlayers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Connect to the socket server
    if (!socket.connected) {
      socket.connect();
      console.log("Connecting to socket server...");
    }

    socket.on("connect", () => {
      console.log("Connected to socket server with ID:", socket.id);
    });

    // Emit joinRoom event only if the player hasn't joined yet
    if (roomCode && userId) {
      console.log(`Attempting to join room: ${roomCode} with userId: ${userId}`);
      socket.emit("joinRoom", { roomCode, userId });
      console.log(`Emitted joinRoom for roomCode: ${roomCode}`);
    }

    // Handle player list updates
    const handlePlayerJoined = (playerList) => {
      console.log("Updated Player List:", playerList);
      setPlayers(playerList);
    };

    socket.on("playerJoined", handlePlayerJoined);

    // Handle incoming chat messages
    const handleChatMessage = (message) => {
      console.log("Received message:", message);
      setChatMessages((prev) => [...prev, message]);
    };

    socket.on("chat-message", handleChatMessage);

    // Cleanup function
    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("playerJoined", handlePlayerJoined);
      socket.off("chat-message", handleChatMessage);
      // Don't disconnect the socket here if you plan to use it in GamePage
    };
  }, [roomCode, userId]);

  // Save Room to Database
  const saveRoomToDB = async (roomCode, userId) => {
    try {
      const response = await fetch("http://localhost:5000/api/game/saveRoomCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to save room code");
      }

      console.log("Room saved successfully:", await response.json());
    } catch (error) {
      console.error("Error saving room to DB:", error);
    }
  };

  // Handle room details input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoomDetails({ ...roomDetails, [name]: value });
  };

  // Sending messages to the server
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // Emit the message to the server
      socket.emit("sendMessage", { roomCode, userId, message: newMessage.trim() });
      setNewMessage(""); // Clear the input field
    }
  };

  const handleStartGame = () => {
    if (players.length < 2) {
      alert("At least two players are required to start the game");
      return;
    }
  
    socket.emit("startGame", {
      roomCode,
      players,
      gameOptions: {
        rounds: roomDetails.rounds,
        drawTime: roomDetails.drawTime,
        hints: roomDetails.hints,
      },
    });
  
    navigate("/game", {
      state: {
        roomCode,
        players,
        gameOptions: {
          rounds: roomDetails.rounds,
          drawTime: roomDetails.drawTime,
          hints: roomDetails.hints,
        },
        isHost: true,
      },
      replace: true,
    });
  };
  

  return (
    <div className="room-wrapper">
      <div className="title-cr">Skribbl.io</div>
      <div className="create-room-page">
        <div className="header">
          <div className="game-info">
            <p>Waiting for players to join...</p>
          </div>
        </div>

        <div className="room-container">
          {/* Left Panel */}
          <div className="left-panel">
            <h3>Players in Room</h3>
            <ul>
              {players.map((player, index) => (
                <li key={index}>{player.userId}</li>
              ))}
            </ul>
          </div>

          {/* Middle Panel */}
          <div className="middle-container">
            <div className="options">
              <label>
                Number of Players:
                <input
                  type="number"
                  name="players"
                  max="8"
                  min="2"
                  value={roomDetails.players}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Draw Time (seconds):
                <input
                  type="number"
                  name="drawTime"
                  max="120"
                  min="30"
                  value={roomDetails.drawTime}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Rounds:
                <input
                  type="number"
                  name="rounds"
                  max="10"
                  min="1"
                  value={roomDetails.rounds}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Hints:
                <input
                  type="number"
                  name="hints"
                  max="5"
                  min="1"
                  value={roomDetails.hints}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <button className="start-button" onClick={handleStartGame}>
              Start Game
            </button>
            <div className="room-code">Room Code: {roomCode}</div>
          </div>

          {/* Right Panel */}
          <div className="right-panel">
            <h3>Chat</h3>
            <div className="chat-box">
              {chatMessages.map((msg, idx) => (
                <p key={idx}>
                  <strong>{msg.sender}:</strong> {msg.text || "Welcome to the chat!"}
                </p>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="chat-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
