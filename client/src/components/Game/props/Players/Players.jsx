import React, { useMemo, useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { setPlayers, updateScore } from '../../../../Redux/Slices/gameSlice';
import "./Players.css";

const PlayersComponent = ({ socket }) => {
  const dispatch = useDispatch();
  const players = useSelector(state => state.game.players);
  const [sortedPlayers, setSortedPlayers] = useState([...players].sort((a, b) => b.score - a.score));

  const handlePlayerUpdate = useCallback((updatedPlayers) => {
    dispatch(setPlayers(updatedPlayers));
    setSortedPlayers([...updatedPlayers].sort((a, b) => b.score - a.score));
  }, [dispatch]);

  const handleScoreUpdate = useCallback(
    ({ userId, score }) => {
      dispatch(updateScore({ userId, points: score }));
    },
    [dispatch]
  );

  useEffect(() => {
    socket.on("playerJoined", handlePlayerUpdate);
    socket.on("score-update", handleScoreUpdate);

    // Cleanup listeners on unmount
    return () => {
      socket.off("playerJoined", handlePlayerUpdate);
      socket.off("score-update", handleScoreUpdate);
    };
  }, [socket, handlePlayerUpdate, handleScoreUpdate]);

  useEffect(() => {
    setSortedPlayers([...players].sort((a, b) => b.score - a.score));
  }, [players]);

  return (
    <div className="players-panel">
      <h2>Players</h2>
      <ul className="players-list">
        {sortedPlayers.map((player, index) => (
          <li key={index} className="player-item">
            <span className="player-name">{player.userId}</span>
            <span className="player-score">Score: {player.score || 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayersComponent;
