import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import HostGame from './pages/HostGame';
import JoinGame from './pages/JoinGame';
import GameRoom from './pages/GameRoom';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/host" element={<HostGame />} />
                <Route path="/join" element={<JoinGame />} />
                <Route path="/game" element={<GameRoom />} />
            </Routes>
        </Router>
    );
}

export default App;
