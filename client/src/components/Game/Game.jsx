import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setPlayers, setCurrentRound, addChatMessage, setTurnState, endGame, resetGame, startWaitingForWordSelection } from '../../Redux/Slices/gameSlice';
import PlayerStats from './props/Players/Players';
import CanvasComponent from './props/Canvas/Canvas';
import ChatComponent from './props/Chat/Chat';
import socket from '../socket';
import './Game.css';

const GamePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [timer, setTimer] = useState(0); // Initialize with 0 or the starting value you prefer
  const [wordOptions, setWordOptions] = useState([]);
  const [showEndGamePrompt, setShowEndGamePrompt] = useState(false);
  const [hints, setHints] = useState(''); // State for hints

  const { roomCode, gameOptions, players: initialPlayers, isHost } = location.state || {};
  const { players, currentRound, chatMessages, turnState, gameEnded } = useSelector((state) => state.game);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
  
    if (roomCode && userId) {
      console.log(`Attempting to join room: ${roomCode} with userId: ${userId}`);
      socket.emit('joinRoom', { roomCode, userId });
      console.log(`Emitted joinRoom for roomCode: ${roomCode}`);
    }
  
    const handlePlayerJoined = (updatedPlayers) => {
      console.log('Players in room:', updatedPlayers);
      dispatch(setPlayers(updatedPlayers));
    };
  
    const handleRoundUpdate = (roundNumber) => {
      console.log('Current Round:', roundNumber);
      dispatch(setCurrentRound(roundNumber));
    };
  
    const handleChatMessage = (message) => {
      console.log('New chat message:', message);
      dispatch(addChatMessage(message));
    };
  
    const handleTurnUpdate = (turnData) => {
      console.log('Turn Data received:', turnData);
      dispatch(setTurnState(turnData));
    };
  
    const handleChooseWord = (options) => {
      console.log('Word options received:', options);
      setWordOptions(options);
    };
  
    const handleWordUpdate = (wordData) => {
      console.log('Word data received:', wordData);
      dispatch(
        setTurnState((prevState) => ({
          ...prevState,
          wordHints: wordData.wordHints,
        }))
      );
    };
  
    const handleRevealHint = (hint) => {
      setHints(hint);
    };
  
    const handleStartTimer = ({ drawTime }) => {
      console.log('Start Timer Event received:', drawTime);
      setTimer(drawTime); // Set timer when drawing phase starts
      setHints(''); // Reset hints at the start of the turn
    };
  
    const handleNextTurn = () => {
      console.log('Next Turn Event received');
      setTimer(0); // Reset the timer when the turn ends
      dispatch(startWaitingForWordSelection()); // Transition to waiting for word selection
    };
  
    const handleGameEnded = () => {
      console.log('Game Ended Event received');
      dispatch(endGame());
      setShowEndGamePrompt(true);
    };
  
    const handleUpdateTimer = (newTimer) => {
      setTimer(newTimer); // Update timer state based on server event
    };
  
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('round-update', handleRoundUpdate);
    socket.on('chat-message', handleChatMessage);
    socket.on('turn-update', handleTurnUpdate);
    socket.on('choose-word', handleChooseWord);
    socket.on('word-update', handleWordUpdate);
    socket.on('startTimer', handleStartTimer);
    socket.on('timerExpired', handleNextTurn); // Listen for timerExpired and handle next turn
    socket.on('nextTurn', handleNextTurn);
    socket.on('gameEnded', handleGameEnded);
    socket.on('updateTimer', handleUpdateTimer); // Listen for timer updates from server
    socket.on('allCorrectGuesses', handleNextTurn); // Handle all correct guesses
    socket.on('revealHint', handleRevealHint); // Add event listener for revealHint to update hints state
  
    if (isHost) {
      socket.emit('initiateGame', { roomCode });
    }
  
    // Handle resetting game state for all players
    const handleGameRestarted = () => {
      setShowEndGamePrompt(false);
      dispatch(resetGame());
    };
  
    socket.on('gameRestarted', handleGameRestarted);
  
    return () => {
      console.log("Cleaning up socket listeners");
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('round-update', handleRoundUpdate);
      socket.off('chat-message', handleChatMessage);
      socket.off('turn-update', handleTurnUpdate);
      socket.off('choose-word', handleChooseWord);
      socket.off('word-update', handleWordUpdate);
      socket.off('startTimer', handleStartTimer);
      socket.off('timerExpired', handleNextTurn);
      socket.off('nextTurn', handleNextTurn);
      socket.off('gameEnded', handleGameEnded);
      socket.off('revealHint', handleRevealHint); // Remove event listener for revealHint
      socket.off('updateTimer', handleUpdateTimer); // Remove updateTimer listener
      socket.off('allCorrectGuesses', handleNextTurn); // Remove all correct guesses listener
      socket.off('gameRestarted', handleGameRestarted);
    };
  }, [roomCode, dispatch, isHost]);
  
  
  
  const handleWordSelected = (word) => {
    socket.emit('wordSelected', { roomCode, selectedWord: word });
    dispatch(setTurnState({
      ...turnState,
      phase: 'DRAWING_PHASE',
    }));
    setWordOptions([]);
  };
  
  const userId = localStorage.getItem('userId');
  const isDrawer = turnState.currentPlayer === userId;

  const handlePlayAgainRequest = () => {
    if (isHost) {
      setShowEndGamePrompt(false);
      socket.emit('playAgain', { roomCode, userId });
    }
  };

  const handleLobby = () => {
    socket.emit('returnToLobby', { roomCode, userId });
  };

  useEffect(() => {
    const handleReturnedToLobby = () => {
      navigate('/home');
    };

    socket.on('returnedToLobby', handleReturnedToLobby);

    return () => {
      socket.off('returnedToLobby', handleReturnedToLobby);
    };
  }, [navigate]);

  useEffect(() => {
    const handleCheckAllReadyAndStart = () => {
      socket.emit('playerReady', { roomCode, userId });
    };

    socket.on('checkAllReadyAndStart', handleCheckAllReadyAndStart);

    return () => {
      socket.off('checkAllReadyAndStart', handleCheckAllReadyAndStart);
    };
  }, [roomCode]);

  if (gameEnded && showEndGamePrompt) {
    return (
      <div className="end-game-prompt">
        <h2 className="end-game-header">Game Over!</h2>
        <p className="end-game-subheader">Final Scores:</p>
        <ul className="end-game-scores">
        {players
          .slice() // Create a shallow copy of the players array
          .sort((a, b) => b.score - a.score) // Sort players based on their scores in descending order
          .map((player, index) => (
            <li key={index} className="end-game-score">
              {index === 0 ? '👑 ' : ''}{player.userId}:{player.score}
            </li>
          ))
        }

        </ul>
        {isHost && (
          <>
            <button className="end-game-button" onClick={handlePlayAgainRequest}>Play Again</button>
            <button className="end-game-button" onClick={handleLobby}>Lobby</button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="game-wrapper">
      <div className="title-cr">skribbl.io</div>
      <div className="game-container">
      <div className="game-header">
        <div className="round-time">
          Round {currentRound} of {gameOptions?.rounds} | Time Left: {timer} seconds
        </div>
      <div className="hints">
        {hints}
      </div>
      <div className="word-options">
        {isDrawer && wordOptions.map((word, idx) => (
        <div
          key={idx}
          className="word-option"
          onClick={() => handleWordSelected(word)}
        >
          {word}
        </div>
      ))}
      </div>
      </div>


        <div className="sidebar player-stats">
          <PlayerStats players={players} socket={socket} />
        </div>
        <div className="main-canvas">
          <CanvasComponent
            roomCode={roomCode}
            isHost={isHost}
            isDrawer={isDrawer}
            socket={socket}
          />
        </div>
        <div className="sidebar chat">
          <ChatComponent
            chatMessages={chatMessages}
            roomCode={roomCode}
            socket={socket}
            isDrawer={isDrawer}
          />
        </div>
      </div>
    </div>
  );
};

export default GamePage;
