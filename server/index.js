const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../client/dist')));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for this demo
        methods: ["GET", "POST"]
    }
});

// Catch-all to serve React's index.html for non-API routes
app.get('*', (req, res, next) => {
    // If request is for an API or socket, ignore (handled by other middlewares/socket)
    // Actually express.static handles files first.
    // If not found, send index.html for client-side routing.
    // However, we want to allow socket.io requests to pass through if they hit HTTP endpoint?
    // Start with strictly serving index.html for anything not caught.
    if (req.url.startsWith('/socket.io/')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Game State
// rooms[password] = { gameName, password, hostId, isStarted: false, players: [] }
// player: { id, name, color, selectedCell: null, revealedTo: [] }
const rooms = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Host Game
    socket.on('create_game', ({ gameName, password }) => {
        if (rooms[password]) {
            socket.emit('error', 'Bu şifre ile oda zaten mevcut. Başka bir şifre deneyin.');
            return;
        }

        rooms[password] = {
            gameName,
            password,
            hostId: socket.id,
            isStarted: false,
            players: []
        };

        socket.join(password);
        console.log(`Game created: ${gameName} with password: ${password}`);
        socket.emit('game_created', { gameName, password });
    });

    // Join Game
    socket.on('join_game', ({ playerName, playerColor, password }) => {
        const room = rooms[password];
        if (!room) {
            socket.emit('error', 'Oda bulunamadı. Şifreyi kontrol edin.');
            return;
        }
        if (room.isStarted) {
            socket.emit('error', 'Oyun zaten başladı.');
            return;
        }

        // Check if name exists? Optional.

        const player = {
            id: socket.id,
            name: playerName,
            color: playerColor,
            selectedCell: null,
            revealedTo: [] // List of playerIDs who can see this player's cell
        };

        room.players.push(player);
        socket.join(password);

        io.to(password).emit('player_list_update', room.players);
        socket.emit('joined_success', { gameName: room.gameName, isHost: room.hostId === socket.id });

        console.log(`${playerName} joined room ${password}`);
    });

    // Start Game (Host only)
    socket.on('start_game', ({ password }) => {
        const room = rooms[password];
        if (room && room.hostId === socket.id) {
            room.isStarted = true;
            io.to(password).emit('game_started');
        }
    });

    // End Game (Host only)
    socket.on('end_game', ({ password }) => {
        const room = rooms[password];
        if (room && room.hostId === socket.id) {
            // Notify all players
            io.to(password).emit('game_ended');
            // Clear room data
            delete rooms[password];
            console.log(`Game ended and room ${password} deleted by host.`);
        }
    });

    // Select Cell
    socket.on('select_cell', ({ password, cellId }) => {
        const room = rooms[password];
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.selectedCell = cellId;
            // Notify only that this player is "ready" or simply update state?
            // Prompt says: "everyone will select a square and press confirm"
            // Maybe we emit an event that "Player X has selected a spot" (without showing which)
            io.to(password).emit('player_state_update', { playerId: socket.id, hasSelected: true });
        }
    });

    // Request Reveal
    socket.on('request_reveal', ({ password, targetPlayerId }) => {
        // Send request to target
        io.to(targetPlayerId).emit('reveal_request_received', { requesterId: socket.id });
    });

    // Respond Reveal
    socket.on('respond_reveal', ({ password, requesterId, accepted }) => {
        if (accepted) {
            const room = rooms[password];
            const self = room.players.find(p => p.id === socket.id);
            if (self) {
                self.revealedTo.push(requesterId);
                // Send the secret cell to the requester
                io.to(requesterId).emit('reveal_granted', { targetId: socket.id, cellId: self.selectedCell });
            }
        } else {
            // Optional: Notify rejected
        }
    });

    // Updates / Disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
        // Remove player from rooms? Or keep for reconnection? For now, simple remove or ignore.
        // If Host leaves?
        for (const pass in rooms) {
            const room = rooms[pass];
            const index = room.players.findIndex(p => p.id === socket.id);
            if (index !== -1) {
                room.players.splice(index, 1);
                io.to(pass).emit('player_list_update', room.players);
                if (room.players.length === 0) {
                    delete rooms[pass];
                }
                break;
            }
        }
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
