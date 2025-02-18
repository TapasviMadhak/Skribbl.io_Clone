import { Server } from "socket.io";
import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import User from "../models/User.js"; // Adjust this path as needed

const rooms = {}; // Assuming rooms is a global object managing game rooms

const gameStates = {
  WAITING_FOR_WORD_SELECTION: 'WAITING_FOR_WORD_SELECTION',
  DRAWING_PHASE: 'DRAWING_PHASE',
  TURN_ENDED: 'TURN_ENDED'
};

const initializeRoomState = (roomCode, gameOptions) => {
  rooms[roomCode] = {
    players: [],
    currentRound: 1,
    timer: null,
    timerInterval: null,
    currentDrawerIndex: -1,
    currentDrawer: null,
    word: '',
    wordHints: '',
    revealedIndices: [],
    currentHintIndex: 0,
    gameOptions: gameOptions,
    gameState: gameStates.WAITING_FOR_WORD_SELECTION
  };
};

const words = [
  "pen", "caterpillar", "rocket", "alligator", "pizza", "shirt", "kite", "eyes", "chair", "cup", "jacket", "hippo", "bird", "monster",
  "bracelet", "coat", "balloon", "dinosaur", "head", "book", "mouse", "smile", "bridge", "blocks", "milk", "eye", "oval", "snowflake",
  "broom", "cheese", "lion", "lips", "beach", "cloud", "bus", "elephant", "sunglasses", "lemon", "star", "spoon", "boat", "turtle",
  "drum", "doll", "ant", "motorcycle", "bike", "pencil", "bunk 1 bed", "moon", "inchworm", "slide", "hat", "cat", "tail", "helicopter",
  "square", "Mickey Mouse", "octopus", "door", "table", "egg", "bell", "nose", "spider", "horse", "finger", "glasses", "jar", "girl",
  "ear", "lizard", "flower", "snowman", "baby", "car", "bread", "blanket", "apple", "bench", "skateboard", "pig", "ice cream cone",
  "frog", "feet", "lollipop", "heart", "ears", "bed", "carrot", "person", "boy", "train", "truck", "bug", "legs", "bowl", "lamp", "desk",
  "purse", "light", "mountain", "snail", "basketball", "orange", "bear", "chicken", "grass", "cookie", "clock", "ghost", "spider web",
  "ocean", "monkey", "shoe", "dog", "face", "circle", "water", "butterfly", "house", "robot", "mouth", "branch", "worm", "socks", "grapes",
  "crab", "banana", "computer", "bee", "whale", "seashell", "snake", "sun", "swing", "bat", "pie", "wheel", "bunny", "hand", "cherry",
  "jellyfish", "tree", "stairs", "duck", "leaf", "dragon", "giraffe", "ball", "pants", "ring", "airplane", "candle", "cow", "cupcake",
  "football", "hamburger", "bone", "corn", "trip", "cobra", "bottle", "curtains", "soap", "mailman", "banana peel", "railroad", "back",
  "lipstick", "knee", "broccoli", "face", "tape", "hot dog", "shadow", "lawnmower", "table", "trash can", "rainbow", "hippopotamus", "soda",
  "laundry basket", "city", "match", "hill", "violin", "mailbox", "tire", "pumpkin", "zebra", "shelf", "eel", "beach", "salt and pepper",
  "ladder", "blue jeans", "address", "radish", "sea turtle", "dress", "lid", "family", "ladybug", "window", "cheeseburger", "yo-yo",
  "frog", "whistle", "glove", "magazine", "church", "chameleon", "boot", "tongue", "hospital", "thief", "smile", "potato", 
  "hairbrush", "stork", "computer", "school", "heel", "pogo stick", "tent", "cucumber", "fox", "three-toed sloth", "sprinkler",
  "garden", "blowfish", "crib", "wing", "brain", "net", "song", "drums", "bagel", "baby", "starfish", "corner", "carpet", "bicycle",
  "strawberry", "horse", "rug", "puzzle", "snowball", "aircraft", "gate", "sidewalk", "pan", "marshmallow", "bell pepper", 
  "watering can", "plate", "jungle", "camera", "forehead", "towel", "surfboard", "coin", "watch", "chin", "key", "blimp", "cowboy",
  "picture frame", "piano", "lake", "pirate", "box", "paw", "toast", "swimming pool", "silverware", "salt", "tissue", "shovel", 
  "hoof", "dominoes", "roller blading", "base", "rose", "spider web", "hopscotch", "spoon", "elbow", "pinwheel", "french fries",
  "log", "doorknob", "bag", "attic", "beaver", "unicorn", "seahorse", "scar", "snowflake", "eraser", "jelly", "battery", "easel", 
  "jar", "barn", "bathtub", "paperclip", "photograph", "maid", "ring", "outside", "vase", "electrical outlet", "room", "birthday cake", 
  "map", "coconut", "spool", "chocolate chip cookie", "muffin", "ski", "stapler", "t-shirt", "lock", "braid", "seesaw", "half", "paper", 
  "pizza", "dock", "shoulder", "lunchbox", "spring", "treasure", "queen", "fang", "round", "dragonfly", "newspaper", "mail", "knot", 
  "tusk", "umbrella", "ticket", "lawn mower", "shark", "neck", "toothbrush", "hook", "wax", "mop", "beehive", "forest", "money", "napkin", 
  "wreath", "music", "quilt", "chain", "backbone", "sheep", "banana split", "baseball", "basket", "printer", "cello", "circus", "whisk", 
  "dimple", "hummingbird", "nest", "wrench", "fork", "garage", "stump", "pine tree", "saw", "stove", "toaster", "park", "hula hoop", 
  "garbage", "peanut", "daddy longlegs", "hair", "bib", "spare", "light switch", "king", "headband", "America", "nature", "milk", 
  "refrigerator", "mattress", "tennis", "popsicle", "stomach", "pajamas", "password", "nail", "stamp", "nut", "palace", "gingerbread man", 
  "dog leash", "front porch", "wood", "mitten", "rhinoceros", "popcorn", "teeth", "stingray", "happy", "onion", "wall", "pen", "alarm clock", 
  "door", "crayon", "swing", "maze", "jewelry", "golf", "gift", "bowtie", "fur", "gumball", "pear", "tiger", "peach", "washing machine", 
  "doormat", "desk", "hockey", "crack", "cast", "flashlight", "dustpan", "scissors", "skate", "wallet", "sink", "coal", "brick", "hug", 
  "doghouse", "deep", "pelican", "page", "lightsaber", "toe", "rake", "tulip", "torch", "teapot", "bucket", "trumpet", "paint", "hair dryer", 
  "pineapple", "calendar", "pretzel", "candle", "sailboat", "storm", "tank", "volcano", "flute", "ironing board", "clam", "waist", "catfish", 
  "top hat", "skirt", "astronaut", "rain", "button", "dollar", "spaceship", "fishing pole", "video camera", "penguin", "lemon", "poodle", 
  "hip", "roof", "state", "claw", "clown", "rocking chair", "belt", "mini blinds", "airport", "cheetah", "spine", "pond", "cage", "mouse", 
  "bomb", "ice", "cake", "cockroach", "batteries", "fist", "flamingo", "purse", "lighthouse", "manatee", "iPad", "telephone", "harp", "eagle", 
  "electricity", "lobster", "cheek", "shallow", "suitcase", "campfire", "flagpole", "chalk", "artist", "skunk", "apple pie", "mushroom", 
  "corndog", "smoke", "ship", "grill", "food", "cricket", "pencil", "TV", "rolly polly", "dolphin", "bathroom scale", "bubble", "porcupine", 
  "owl", "stoplight", "chimney", "light bulb", "deer", "platypus", "globe", "tadpole", "cell phone", "river", "sunflower", "mouth"
];

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Adjust to your frontend URL
      methods: ["GET", "POST"],
    },
  });

  const getRandomWords = (wordList, count) => {
    const shuffled = wordList.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const startNextTurn = (roomCode) => {
    const room = rooms[roomCode];
    if (room) {
      room.gameState = gameStates.WAITING_FOR_WORD_SELECTION;
      io.to(roomCode).emit("nextTurn");

      // Reset turn state for the next turn
      if (room.currentDrawerIndex === -1) {
        room.currentDrawerIndex = 0;
      } else {
        room.currentDrawerIndex = (room.currentDrawerIndex + 1) % room.players.length;

        if (room.currentDrawerIndex === 0) {
          room.currentRound += 1;
          if (room.currentRound > room.gameOptions.rounds) {
            io.to(roomCode).emit("gameEnded");
            console.log(`Game ended: Room ${roomCode}, Round ${room.currentRound}`);
            return;
          }
          io.to(roomCode).emit("round-update", room.currentRound);
        }
      }

      if (room.players.length > 0 && room.currentDrawerIndex < room.players.length) {
        const currentDrawerInfo = room.players[room.currentDrawerIndex];
        room.currentDrawer = currentDrawerInfo.userId;
        const wordOptions = getRandomWords(words, 3);
        io.to(currentDrawerInfo.socketId).emit("choose-word", wordOptions);

        io.to(roomCode).emit("turn-update", {
          currentPlayer: room.currentDrawer,
          word: "",
          wordHints: "",
          phase: gameStates.WAITING_FOR_WORD_SELECTION,
        });

        console.log(`Turn Updated: Current Drawer - ${room.currentDrawer}, Round ${room.currentRound}`);
      } else {
        console.error(`Invalid currentDrawerIndex: ${room.currentDrawerIndex} or empty players array in room: ${roomCode}`);
      }
    }
  };

  const handleAllCorrectGuesses = (roomCode) => {
    const room = rooms[roomCode];
    if (room) {
      clearInterval(room.timerInterval); // Clear the timer interval

      io.to(roomCode).emit("allCorrectGuesses");

      // Log all correct guesses event
      console.log('All correct guesses, waiting for word selection to start next turn');
      startNextTurn(roomCode); // Ensure the next turn starts correctly
    }
  };

  const handleTimerExpired = (roomCode) => {
    const room = rooms[roomCode];
    if (room) {
      clearInterval(room.timerInterval); // Clear the timer interval
      room.gameState = gameStates.TURN_ENDED;
      io.to(roomCode).emit("timerExpired");

      // Log timer expiration event
      console.log('Timer expired, transitioning to TURN_ENDED state');
      startNextTurn(roomCode); // Ensure the next turn starts correctly
    }
  };

  const startTurnTimer = (roomCode, drawTime) => {
    const room = rooms[roomCode];
    if (room) {
      clearInterval(room.timerInterval); // Clear any existing timer intervals
      room.timer = drawTime;
      room.timerInterval = setInterval(() => {
        room.timer -= 1;
        if (room.timer <= 0) {
          clearInterval(room.timerInterval);
          handleTimerExpired(roomCode);
        }
        io.to(roomCode).emit('updateTimer', room.timer); // Emit timer update to all clients
      }, 1000);
    }
  };
  

  const handleWordSelected = (roomCode, selectedWord) => {
    const room = rooms[roomCode];
    if (room) {
      room.word = selectedWord;
      room.wordHints = "_ ".repeat(selectedWord.length).trim(); // Initialize with underscores and spaces
      room.revealedIndices = getRandomIndices(selectedWord.length, room.gameOptions.hints); // Choose random indices for hints
      room.currentHintIndex = 0;
      room.gameState = gameStates.DRAWING_PHASE;
  
      io.to(roomCode).emit("word-update", {
        word: room.word,
        wordHints: room.wordHints,
      });
  
      console.log(`Word selected: ${selectedWord}`);
  
      // Emit start timer event to all clients
      io.to(roomCode).emit("startTimer", { drawTime: room.gameOptions.drawTime || 60 });
  
      // Start revealing hints at intervals
      setTimeout(() => {
        const hintInterval = setInterval(() => {
          if (room.currentHintIndex < room.revealedIndices.length) {
            const hintIndex = room.revealedIndices[room.currentHintIndex];
            const wordHintsArray = room.wordHints.split(' ');
            wordHintsArray[hintIndex] = room.word[hintIndex];
            room.wordHints = wordHintsArray.join(' ');
            io.to(roomCode).emit("revealHint", room.wordHints);
            room.currentHintIndex++;
          } else {
            clearInterval(hintInterval);
          }
        }, (room.gameOptions.drawTime * 1000) / room.gameOptions.hints);
      }, 1000); // Delay to show underscores first
  
      // Start the timer for the drawing phase
      startTurnTimer(roomCode, room.gameOptions.drawTime || 60);
    }
  };
  

  const getRandomIndices = (length, count) => {
    const indices = Array.from({ length }, (_ , i) => i);
    const shuffled = indices.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
  
    socket.on("joinRoom", ({ roomCode, userId }) => {
      if (!rooms[roomCode]) {
        rooms[roomCode] = { players: [], currentDrawerIndex: -1 };
      }
  
      // Check if the user is already in the room
      const existingPlayer = rooms[roomCode].players.find(player => player.userId === userId);
      if (existingPlayer) {
        existingPlayer.socketId = socket.id; // Update socket ID if user re-joins
        console.warn(`User ${userId} with socket ID ${socket.id} re-joined room ${roomCode}`);
      } else {
        rooms[roomCode].players.push({ socketId: socket.id, userId, score: 0, ready: false });
        console.log(`User ${userId} joined room ${roomCode}`);
      }
  
      socket.join(roomCode);
      io.to(roomCode).emit("playerJoined", rooms[roomCode].players); // Emit updated player list to all clients
    });
  
    socket.on("initiateGame", ({ roomCode }) => {
      const room = rooms[roomCode];
      if (room) {
        room.currentRound = 1;
        if (room.gameOptions) {
          room.maxRounds = room.gameOptions.rounds; // Ensure gameOptions are defined in the room
          io.to(roomCode).emit("round-update", room.currentRound);
          startNextTurn(roomCode);
        } else {
          console.error(`gameOptions not found for room ${roomCode}`);
        }
      }
    });
  
    socket.on("startGame", ({ roomCode, players, gameOptions }) => {
      if (!rooms[roomCode]) {
        rooms[roomCode] = { players: [], currentDrawerIndex: -1, gameOptions: {} };
      }
      const room = rooms[roomCode];
      room.players = players;
      room.gameOptions = gameOptions; // Ensure gameOptions are stored correctly
      room.maxRounds = gameOptions.rounds;
      room.currentRound = 1;
  
      // Assign the first player as the host if not already assigned
      if (!room.hostId) {
        room.hostId = players[0].userId; // Assuming the first player is the host
      }
  
      io.to(roomCode).emit("gameStarted", { roomCode, players, gameOptions, hostId: room.hostId });
      io.to(roomCode).emit("round-update", room.currentRound);
    });
  
    socket.on("playAgain", ({ roomCode, userId }) => {
      const room = rooms[roomCode];
      if (room && room.hostId === userId) { // Check if the user is the host
        room.players.forEach(player => {
          player.score = 0; // Reset player scores
          player.ready = false; // Mark all players as not ready
        });
        room.currentRound = 1; // Reset the current round
        io.to(roomCode).emit("gameRestarted", { players: room.players, gameOptions: room.gameOptions });
  
        // Ensure the game restarts only after all players are ready
        io.to(roomCode).emit("checkAllReadyAndStart"); // Instruct all clients to check readiness
      }
    });
  
    socket.on("playerReady", ({ roomCode, userId }) => {
      const room = rooms[roomCode];
      if (room) {
        const player = room.players.find(player => player.userId === userId);
        if (player) {
          player.ready = true;
          console.log(`User ${userId} is ready in room ${roomCode}`);
          io.to(roomCode).emit("playerReady", { userId });
  
          // Check if all players are ready
          const allReady = room.players.every(player => player.ready);
          if (allReady) {
            // Start the game if all players are ready
            startNextTurn(roomCode);
          }
        }
      }
    });
  
    socket.on("returnToLobby", ({ roomCode, userId }) => {
      const room = rooms[roomCode];
      if (room && room.hostId === userId) { // Check if the user is the host
        io.to(roomCode).emit("returnedToLobby"); // Notify all players to return to lobby
      }
    });
  
    socket.on("sendMessage", ({ roomCode, userId, message }) => {
      try {
        if (!roomCode || !userId || !message) {
          console.error("Missing roomCode, userId, or message");
          return;
        }
    
        const room = rooms[roomCode];
    
        if (userId === room.currentDrawer) {
          console.warn("Drawer is not allowed to guess.");
          return; // Prevent the drawer from guessing
        }
    
        const messageId = uuidv4(); // Generate a unique identifier for the message
    
        if (room.word && message.toLowerCase() === room.word.toLowerCase()) {
          const player = room.players.find((p) => p.userId === userId);
          if (player) {
            player.score += 10;
            // Notify all players of a correct guess without revealing the word
            io.to(roomCode).emit("chat-message", { id: messageId, sender: userId, text: "Correct guess! 10 points earned!!", correct: true });
            io.to(roomCode).emit("score-update", { userId, score: player.score });
    
            // Check if all players have guessed correctly
            const allGuessed = room.players.every((p) => p.userId === room.currentDrawer || p.score > 0);
            if (allGuessed) {
              clearInterval(room.timerInterval); // Clear the timer interval on correct guess
              io.to(roomCode).emit("nextTurn");
              startNextTurn(roomCode);
            }
          }
        } else {
          io.to(roomCode).emit("chat-message", { id: messageId, sender: userId, text: message });
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
    

    socket.on("wordSelected", ({ roomCode, selectedWord }) => {
      handleWordSelected(roomCode, selectedWord);
    });

    socket.on("nextTurn", ({ roomCode }) => {
      startNextTurn(roomCode);
    });
  
    socket.on("timerExpired", ({ roomCode }) => {
      handleTimerExpired(roomCode);
    });
  
    socket.on("allCorrectGuesses", ({ roomCode }) => {
      handleAllCorrectGuesses(roomCode);
    });
  
    socket.on("drawing", ({ roomCode, x, y, color, brushSize, type }) => {
      const room = rooms[roomCode];
      if (!room) {
        console.warn(`Room ${roomCode} does not exist`);
        return;
      }
  
      const drawer = room.players.find((player) => player.userId === room.currentDrawer);
      if (!drawer || drawer.socketId !== socket.id) {
        console.warn("Non-drawer is not allowed to draw.");
        return; // Prevent non-drawers from drawing
      }
  
      socket.to(roomCode).emit("drawing-data", { x, y, color, brushSize, type });
    });
  
    socket.on("clear-canvas", ({ roomCode }) => {
      socket.to(roomCode).emit("clear-canvas");
    });
  
    socket.on("disconnect", () => {
      try {
        for (const roomCode in rooms) {
          const room = rooms[roomCode];
          if (room) {
            room.players = room.players.filter(
              (player) => player.socketId !== socket.id
            );
            io.to(roomCode).emit("playerJoined", room.players);
          }
        }
        console.log(`User ${socket.id} disconnected`);
      } catch (error) {
        console.error("Error during disconnect:", error);
      }
    });
  });
  
  
};
export default initializeSocket;