# Skribbl.io Clone

## Overview

Welcome to the Interactive Drawing Game! This project is an engaging real-time drawing and guessing game built using ReactJS for the client-side and NodeJS for the server-side. The game features real-time drawing collaboration, interactive chat, robust state management with Redux, and a dynamic timer and hint system.

## Features

- 🖌️ Real-time drawing collaboration
- 🗨️ Interactive chat with guessing functionality
- 📈 Robust state management with Redux
- ⏲️ Dynamic timer and hint system
- 👥 Player profiles and scoring system
- 🎨 Customizable drawing tools and colors
- 🔄 Seamless game flow with automatic turn transitions

## Installation

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Git

### Clone the Repository

```bash
git clone https://github.com/TapasviMadhak/Skribbl.io_Clone.git
cd skribbl.io_clone
```

### Server Setup
1. Navigate to the server directory:
```bash
cd server
```
2. Install server dependencies:
```bash
npm i
```
3. Start the server:
```bash
npm run dev or
npm start
```
### Client Setup
(In new a terminal of root directory of project)
1. Navigate to the client directory:
```bash
cd client
```
2. Install client dependencies:
```bash
npm i
```
3. start the client:
```bash
npm run dev or
npm start
```

### Running the Game
1. Ensure both the server and client are running.

2. Open your web browser and navigate to http://localhost:5173.

3. Enjoy the game!

## How to Play
1. Join a Room: Enter a room code to join an existing game or create a new room.

2. Drawing: The drawer selects a word and draws it on the canvas while others guess.

3. Guessing: Players type their guesses in the chat box. Correct guesses earn points.

4. Scoring: Points are awarded based on correct guesses. The drawer also earns points for each correct guess.

5. Turn Transition: The game automatically transitions to the next turn once the timer expires or all players have guessed correctly.

6. End of Game: The game ends after a set number of rounds. Scores are displayed, and the player with the highest score is crowned the winner.

### Scoring System
- Correct Guess:
  * Player: 10 points per correct guess.
  * Drawer: 10 points per correct guess made by other players.
- Guessing Order:
  * First correct guesser earns an additional 5 points.
- Time-Based Scoring (Optional):
  * Faster guesses may yield more points.

## Future Enhancements
* Customizable themes and drawing tools.
* JWT token authentication.
* Player avatars and profiles.
* Interactive chat reactions and emojis.
* leaderboards and advance points management.
* Enhanced game modes (e.g., team play, timed challenges).
* Integration with social media for sharing and inviting friends.
* Tutorials and practice modes.

## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
