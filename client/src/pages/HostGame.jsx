import React, { useState, useContext } from 'react';
import { TextField, Button, Container, Box, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../App';

function HostGame() {
    const [gameName, setGameName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const socket = useContext(SocketContext);
    const navigate = useNavigate();

    const handleCreate = () => {
        if (!gameName || !password) {
            setError("Lütfen oyun adı ve şifre giriniz.");
            return;
        }

        socket.emit('create_game', { gameName, password });

        socket.once('game_created', (data) => {
            // Navigate to game room
            // We pass state or just let the socket state handle it via useEffect in GameRoom
            // But passing necessary info via location state is safer
            navigate('/game', { state: { password, isHost: true } });
        });

        socket.once('error', (msg) => {
            setError(msg);
        });
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100vh',
                gap: 3
            }}>
                <Typography variant="h4" gutterBottom>
                    Oyun Oluştur
                </Typography>

                {error && <Alert severity="error">{error}</Alert>}

                <TextField
                    label="Oyun Adı"
                    variant="outlined"
                    fullWidth
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                />
                <TextField
                    label="Oyun Şifresi (Oda ID)"
                    variant="outlined"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                    variant="contained"
                    size="large"
                    onClick={handleCreate}
                >
                    Start Game (Odayı Kur)
                </Button>
            </Box>
        </Container>
    );
}

export default HostGame;
