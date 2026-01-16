# Mystery Grid Game

A real-time multiplayer grid game where players hide in a 19x21 grid and try to find each other.

## Prerequisites
You need **Node.js** installed on your system to run this application.
1. Download and install Node.js from https://nodejs.org/
2. Restart your terminal/command prompt after installation.

## Installation

1. Open a terminal in the project folder.
2. Setup the Server:
   ```bash
   cd server
   npm install
   ```
3. Setup the Client:
   ```bash
   cd ../client
   npm install
   ```
   (Note: Ignore warnings if `create-vite` didn't run fully, `npm install` should fix dependencies based on package.json).

## Running the Application

1. **Start the Server:**
   Open a terminal in the `server` folder:
   ```bash
   npm start
   ```
   You should see: `SERVER RUNNING ON PORT 3001`

2. **Start the Client:**
   Open a NEW terminal in the `client` folder:
   ```bash
   npm run dev
   ```
   Click the link provided (usually `http://localhost:5173`) to open the game in your browser.

## How to Play
1. Open multiple browser tabs (one for Host, others for Players).
2. **Tab 1 (Host):** Click "Host Game", enter a Name and Password (e.g., "123").
3. **Tab 2 (Player):** Click "Join Game", enter Name, select Color, and enter Password "123".
4. **Host:** Click "Start Game" when players are ready.
5. **Game:**
   - Click a cell on the grid to select your hidden spot.
   - Click a player in the sidebar to request to see their spot.
   - Accepts requests to reveal your spot to others.
