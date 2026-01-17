import React, { useState } from 'react';
import { TextField, Button, Container, Box, Typography, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ref, set, get } from "firebase/database";
import { db } from '../firebase';

// Simple UUID generator
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

const colors = [
    { name: 'Red', hex: '#f44336' },
    { name: 'Blue', hex: '#2196f3' },
    { name: 'Green', hex: '#4caf50' },
    { name: 'Yellow', hex: '#ffeb3b' },
    { name: 'Purple', hex: '#9c27b0' },
    { name: 'Orange', hex: '#ff9800' },
];

function HostGame() {
    const [gameName, setGameName] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [playerColor, setPlayerColor] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleCreate = async () => {
        if (!gameName || !password || !playerName || !playerColor) {
            setError("Lütfen tüm alanları (Oyun Adı, İsim, Renk, Şifre) doldurunuz.");
            return;
        }

        const roomRef = ref(db, 'rooms/' + password);

        // Check if room exists
        const snapshot = await get(roomRef);
        if (snapshot.exists()) {
            setError("Bu şifre ile oda zaten mevcut. Başka bir şifre deneyin.");
            return;
        }

        const hostId = generateId();

        // Register Host as the first player
        const hostPlayer = {
            id: hostId,
            name: playerName,
            color: playerColor,
            selectedCell: "",
            revealedTo: {}
        };

        // Create Room with Host in players list
        await set(roomRef, {
            gameName,
            password,
            hostId,
            isStarted: false,
            players: {
                [hostId]: hostPlayer
            }
        });

        // Navigate
        navigate('/game', { state: { password, isHost: true, myPlayerId: hostId } });
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

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Host Oyuncu Adı"
                        variant="outlined"
                        fullWidth
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Renk</InputLabel>
                        <Select
                            value={playerColor}
                            label="Renk"
                            onChange={(e) => setPlayerColor(e.target.value)}
                        >
                            {colors.map((c) => (
                                <MenuItem key={c.hex} value={c.hex}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: c.hex }} />
                                        {c.name}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

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
                    Create & Start Game
                </Button>
            </Box>
        </Container>
    );
}

export default HostGame;
