import React, { useState } from 'react';
import { TextField, Button, Container, Box, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ref, set, get } from "firebase/database";
import { db } from '../firebase';

// Simple UUID generator if uuid package not installed (it was in server package but check client)
// Client didn't have uuid installed in previous steps, let's use a simple random string function
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function HostGame() {
    const [gameName, setGameName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleCreate = async () => {
        if (!gameName || !password) {
            setError("Lütfen oyun adı ve şifre giriniz.");
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

        // Create Room
        await set(roomRef, {
            gameName,
            password,
            hostId,
            isStarted: false,
            players: {} // Firebase stores lists as objects or arrays
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
                    Oyun Oluştur (Firebase)
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
