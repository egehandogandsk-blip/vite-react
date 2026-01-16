import React, { useState, useContext } from 'react';
import { TextField, Button, Container, Box, Typography, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../App';

const colors = [
    { name: 'Red', hex: '#f44336' },
    { name: 'Blue', hex: '#2196f3' },
    { name: 'Green', hex: '#4caf50' },
    { name: 'Yellow', hex: '#ffeb3b' },
    { name: 'Purple', hex: '#9c27b0' },
    { name: 'Orange', hex: '#ff9800' },
];

function JoinGame() {
    const [playerName, setPlayerName] = useState('');
    const [playerColor, setPlayerColor] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const socket = useContext(SocketContext);
    const navigate = useNavigate();

    const handleJoin = () => {
        if (!playerName || !playerColor || !password) {
            setError("Lütfen tüm alanları doldurunuz.");
            return;
        }

        socket.emit('join_game', { playerName, playerColor, password });

        socket.once('joined_success', (data) => {
            navigate('/game', { state: { password, isHost: false, playerName, playerColor } });
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
                    Oyuna Katıl
                </Typography>

                {error && <Alert severity="error">{error}</Alert>}

                <TextField
                    label="Oyuncu Adı"
                    variant="outlined"
                    fullWidth
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                />

                <FormControl fullWidth>
                    <InputLabel>Renk Seçiniz</InputLabel>
                    <Select
                        value={playerColor}
                        label="Renk Seçiniz"
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

                <TextField
                    label="Oyun Şifresi"
                    variant="outlined"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                    variant="contained"
                    size="large"
                    onClick={handleJoin}
                >
                    Join Game
                </Button>
            </Box>
        </Container>
    );
}

export default JoinGame;
