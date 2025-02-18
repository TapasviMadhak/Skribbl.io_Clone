import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import socket from "../../socket";
import "./waiting.css";

const WaitingRoom = () => {
  const [players, setPlayers] = useState([]);
  const [chatMessages, setChatMessages] = useState(["Welcome to the waiting room!"]);
  const [newMessage, setNewMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const roomCode = location.state?.roomCode;
  const userId = localStorage.getItem("userId"); // Retrieve userId from localStorage

  useEffect(() => {
    // Connect to the socket server
    if (!socket.connected) {
      socket.connect();
      console.log("Connecting to socket server...");
    }

    socket.on("connect", () => {
      console.log("Connected to socket server with ID:", socket.id);
    });

    // Emit joinRoom event
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

    // Handle game start event
    const handleGameStarted = (gameData) => {
      const { roomCode, players, gameOptions } = gameData;
      navigate("/game", {
        state: {
          roomCode,
          players,
          gameOptions,
          isHost: false,
        },
        replace: true, // Prevent going back to waiting room
      });
    };
    

    socket.on("gameStarted", handleGameStarted);

    // Cleanup function
    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("playerJoined", handlePlayerJoined);
      socket.off("chat-message", handleChatMessage);
      socket.off("gameStarted", handleGameStarted);
      // Don't disconnect the socket here if you plan to use it in GamePage
    };
  }, [roomCode, userId, navigate]);

  // Sending messages to the server
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socket.emit("sendMessage", { roomCode, userId, message: newMessage.trim() });
      setNewMessage(""); // Clear the input field
    }
  };

  return (
    <div className="waiting-room-wrapper">
      <div className="title-cr">Skribbl.io</div>
      <div className="waiting-room-page">
        <div className="waiting-header">
          <div className="game-info">
            <p>Room Code: {roomCode}</p>
            <p>Waiting for players...</p>
          </div>
        </div>

        <div className="waiting-room-container">
          <div className="waiting-left-panel">
            <h3>Players in Room</h3>
            <ul>
              {players.map((player, index) => (
                <li key={index}>{player.userId}</li>
              ))}
            </ul>
          </div>

          <div className="waiting-right-panel">
            <h3>Chat</h3>
            <div className="waiting-chat-box">
            {chatMessages.map((msg, idx) => (
                <p key={idx}>
                  <strong>{msg.sender} </strong> {msg.text || ""}
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

export default WaitingRoom;
