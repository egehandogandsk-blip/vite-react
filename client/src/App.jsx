import React, { createContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Welcome from './pages/Welcome';
import HostGame from './pages/HostGame';
import JoinGame from './pages/JoinGame';
import GameRoom from './pages/GameRoom';

export const SocketContext = createContext();

// Empty string means it will connect to the same host that serves the page
const socket = io(); // Changed from 'http://localhost:3001' to '' for production

function App() {
    return (
        <SocketContext.Provider value={socket}>
            <Router>
                <Routes>
                    <Route path="/" element={<Welcome />} />
                    <Route path="/host" element={<HostGame />} />
                    <Route path="/join" element={<JoinGame />} />
                    <Route path="/game" element={<GameRoom />} />
                </Routes>
            </Router>
        </SocketContext.Provider>
    );
}

export default App;
