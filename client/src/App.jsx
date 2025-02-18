import React,{useEffect} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import Home from "./components/Home/Home";
import CreateRoom from "./components/Home/CreateRoom/CreateRoom";
import ProtectedRoutes from "./components/ProtectedRoutes";
import WaitingRoom from "./components/Home/waitingRoom/waiting";
import GamePage from "./components/Game/Game";
import "./App.css";
import socket from "./components/socket";

function App() {
  
    useEffect(() => {
      if (!socket.connected) {
        socket.connect();
      }
    }, []);

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/home" element={<Home />} />
            <Route path="/home/createRoom" element={<CreateRoom />} />
            <Route path="/home/waitingRoom" element={<WaitingRoom />} />
            <Route path="/game" element={<GamePage />} />
          </Route>
        </Routes>
      </Router>
  );
}

export default App;
