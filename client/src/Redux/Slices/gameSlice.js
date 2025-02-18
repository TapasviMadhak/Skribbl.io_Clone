import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  players: [],
  currentRound: 1,
  chatMessages: [],
  isHost: false,
  turnState: {
    currentPlayer: null,
    word: '',
    wordHints: '',
    phase: 'WAITING_FOR_WORD_SELECTION', // Initial phase is 'WAITING_FOR_WORD_SELECTION'
  },
  gameEnded: false,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setPlayers: (state, action) => {
      state.players = action.payload.map(player => ({
        ...player,
        score: player.score || 0, // Ensure score is initialized
      }));
    },
    setCurrentRound: (state, action) => {
      state.currentRound = action.payload;
    },
    nextRound: (state) => {
      state.currentRound += 1;
    },
    addChatMessage: (state, action) => {
      const messageExists = state.chatMessages.some(
        msg => msg.id === action.payload.id
      );
      if (!messageExists) {
        state.chatMessages.push(action.payload);
      }
    },
    setHost: (state, action) => {
      state.isHost = action.payload;
    },
    setTurnState: (state, action) => {
      state.turnState = {
        ...state.turnState,
        ...action.payload,
      };
    },
    revealHint: (state, action) => {
      const updatedHints = state.turnState.wordHints.split('');
      updatedHints[action.payload] = state.turnState.word[action.payload];
      state.turnState.wordHints = updatedHints.join('');
    },
    validateGuess: (state, action) => {
      const isCorrect = action.payload.toLowerCase() === state.turnState.word.toLowerCase();
      if (isCorrect) {
        state.turnState.correctGuesses.push(action.payload);
      }
    },
    updateScore: (state, action) => {
      const { userId, points } = action.payload;
      const playerIndex = state.players.findIndex(player => player.userId === userId);
      if (playerIndex !== -1) {
        state.players[playerIndex].score += points;
      }
    },
    endGame: (state) => {
      state.gameEnded = true;
    },
    resetGame: (state) => {
      // Reset game state to initial values for a new game
      state.currentRound = 1;
      state.turnState = {
        currentPlayer: null,
        word: '',
        wordHints: '',
        phase: 'WAITING_FOR_WORD_SELECTION', // Initial phase is 'WAITING_FOR_WORD_SELECTION'
      };
      state.chatMessages = [];
      state.gameEnded = false;
      state.players = state.players.map(player => ({
        ...player,
        score: 0, // Reset player scores
      }));
    },
    startDrawingPhase: (state) => {
      state.turnState.phase = 'DRAWING_PHASE';
    },
    endTurn: (state) => {
      state.turnState.phase = 'TURN_ENDED';
    },
    startWaitingForWordSelection: (state) => {
      state.turnState.phase = 'WAITING_FOR_WORD_SELECTION';
    },
  },
});

export const {
  setPlayers,
  setCurrentRound,
  nextRound,
  addChatMessage,
  setHost,
  setTurnState,
  revealHint,
  validateGuess,
  updateScore,
  endGame,
  resetGame,
  startDrawingPhase,
  endTurn,
  startWaitingForWordSelection,
} = gameSlice.actions;

export default gameSlice.reducer;
