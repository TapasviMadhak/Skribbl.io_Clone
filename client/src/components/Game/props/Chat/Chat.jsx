import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { addChatMessage } from '../../../../Redux/Slices/gameSlice';
import { v4 as uuidv4 } from 'uuid';
import "./Chat.css";

const ChatComponent = ({ roomCode, socket, isDrawer }) => {
  const [newMessage, setNewMessage] = useState("");
  const dispatch = useDispatch();
  const chatMessages = useSelector(state => state.game.chatMessages);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!socket) {
      console.error("Socket is not defined");
      return;
    }

    const handleIncomingMessage = (chatMessage) => {
      dispatch(addChatMessage(chatMessage));
    };

    // Clean up any existing listener before attaching a new one
    socket.off("chat-message", handleIncomingMessage);
    socket.on("chat-message", handleIncomingMessage);

    return () => {
      socket.off("chat-message", handleIncomingMessage);
    };
  }, [socket, dispatch]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (newMessage.trim()) {
      const messageObject = {
        id: uuidv4(), // Generate a unique identifier for the message
        roomCode,
        userId,
        message: newMessage.trim(),
      };

      socket.emit("sendMessage", messageObject);

      setNewMessage("");
    }
  };

  return (
    <div className="chat-panel">
      <h2>Chat</h2>
      <div className="chat-messages">
        {chatMessages.map((msg) => (
          <div key={msg.id} className="chat-message" style={{ color: msg.correct ? "green" : "black" }}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="chat-form">
        <input
          type="text"
          value={newMessage}
          className="chat-input"
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={isDrawer} // Disable input if the user is the drawer
        />
        <button type="submit" disabled={isDrawer}>Send</button>
      </form>
    </div>
  );
};

export default ChatComponent;
