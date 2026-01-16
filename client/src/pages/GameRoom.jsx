import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Button, List, ListItem,
    ListItemText, ListItemAvatar, Avatar, Paper, Grid,
    Dialog, DialogTitle, DialogActions
} from '@mui/material';
import { SocketContext } from '../App';

function GameRoom() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const socket = useContext(SocketContext);

    const [players, setPlayers] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null);
    const [revealedCells, setRevealedCells] = useState({}); // { playerId: cellId }

    // Request handling
    const [requestDialog, setRequestDialog] = useState(null); // { requesterId }

    // derived from state
    const isHost = state?.isHost;
    const password = state?.password;
    const myPlayerId = socket.id;

    useEffect(() => {
        if (!password) {
            navigate('/');
            return;
        }

        // Listeners
        socket.on('player_list_update', (list) => {
            setPlayers(list);
        });

        socket.on('game_started', () => {
            setGameStarted(true);
        });

        socket.on('game_ended', () => {
            alert("Oyun Host tarafından sonlandırıldı.");
            navigate('/');
        });

        socket.on('reveal_request_received', ({ requesterId }) => {
            setRequestDialog({ requesterId });
        });

        socket.on('reveal_granted', ({ targetId, cellId }) => {
            setRevealedCells(prev => ({ ...prev, [targetId]: cellId }));
            alert(`Oyuncunun kapısı açıldı: Hücre ${cellId}`);
        });

        socket.on('player_state_update', ({ playerId, hasSelected }) => {
            // Update player list UI to show they are ready? 
            // For now, we update local players list logic if needed
            setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, hasSelected } : p));
        });

        return () => {
            socket.off('player_list_update');
            socket.off('game_started');
            socket.off('game_ended');
            socket.off('reveal_request_received');
            socket.off('reveal_granted');
            socket.off('player_state_update');
        };
    }, [socket, password, navigate]);

    const handleStartGame = () => {
        socket.emit('start_game', { password });
    };

    const handleEndGame = () => {
        if (confirm("Oyunu bitirmek istediğinize emin misiniz? Herkes odadan atılacak.")) {
            socket.emit('end_game', { password });
        }
    };

    const handleSelectCell = (cellId) => {
        if (selectedCell === cellId) return; // Toggle?
        setSelectedCell(cellId);
        socket.emit('select_cell', { password, cellId });
    };

    const handleExitRoom = () => {
        setSelectedCell(null);
        socket.emit('select_cell', { password, cellId: null }); // Unselect logic if server supported
    };

    const handleRequestReveal = (targetPlayerId) => {
        if (targetPlayerId === myPlayerId) return;
        socket.emit('request_reveal', { password, targetPlayerId });
        alert("İstek gönderildi.");
    };

    const handleRespondReveal = (accepted) => {
        if (requestDialog) {
            socket.emit('respond_reveal', {
                password,
                requesterId: requestDialog.requesterId,
                accepted
            });
            setRequestDialog(null);
        }
    };

    // Grid Generation: 19 rows x 21 cols
    const rows = 19;
    const cols = 21;
    const renderGrid = () => {
        const grid = [];
        for (let r = 0; r < rows; r++) {
            const rowCells = [];
            for (let c = 0; c < cols; c++) {
                const cellId = `${r}-${c}`;
                const isSelected = selectedCell === cellId;
                // Check if this cell is revealed for any player
                // revealedCells is { playerId: cellId }
                // We want to show WHO is there.
                const occupants = Object.entries(revealedCells)
                    .filter(([pid, cid]) => cid === cellId)
                    .map(([pid]) => players.find(p => p.id === pid));

                rowCells.push(
                    <Box
                        key={cellId}
                        onClick={() => handleSelectCell(cellId)}
                        sx={{
                            width: 30,
                            height: 30,
                            border: '1px solid #444',
                            bgcolor: isSelected ? 'primary.main' : 'background.paper',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            '&:hover': { bgcolor: 'action.hover' }
                        }}
                    >
                        {occupants.map((p, i) => (
                            <Box key={p?.id || i} sx={{
                                width: 10, height: 10,
                                borderRadius: '50%',
                                bgcolor: p?.color || 'white',
                                position: 'absolute'
                            }} />
                        ))}
                    </Box>
                );
            }
            grid.push(<Box key={r} sx={{ display: 'flex' }}>{rowCells}</Box>);
        }
        return grid;
    };

    if (!gameStarted) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>Lobi: {state?.gameName || password}</Typography>
                <Typography variant="subtitle1">Şifre: {password}</Typography>
                <Box sx={{ my: 4 }}>
                    <Typography variant="h6">Oyuncular ({players.length})</Typography>
                    <List>
                        {players.map((p) => (
                            <ListItem key={p.id}>
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: p.color }}>{p.name[0]}</Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={p.name} secondary={p.id === state?.hostId ? 'Host' : 'Oyuncu'} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
                {isHost && (
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button variant="contained" size="large" onClick={handleStartGame} disabled={players.length === 0}>
                            Start Game
                        </Button>
                    </Box>
                )}
                {!isHost && <Typography>Hostun oyunu başlatması bekleniyor...</Typography>}
            </Container>
        );
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Sidebar */}
            <Paper sx={{ width: 250, p: 2, overflowY: 'auto' }} elevation={3}>
                <Typography variant="h6" gutterBottom>Oyuncular</Typography>
                <List>
                    {players.map((p) => (
                        <ListItem
                            key={p.id}
                            button
                            onClick={() => handleRequestReveal(p.id)}
                            disabled={p.id === myPlayerId}
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: p.color }}>{p.name[0]}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={p.name}
                                secondary={p.id === myPlayerId ? "Siz" : (revealedCells[p.id] ? "Görünür" : "Gizli")}
                            />
                        </ListItem>
                    ))}
                </List>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button variant="outlined" color="primary" fullWidth onClick={handleExitRoom}>
                        Select Another Exit
                    </Button>

                    {isHost && (
                        <Button variant="contained" color="error" fullWidth onClick={handleEndGame}>
                            End Game / Exit All
                        </Button>
                    )}

                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Mevcut Seçim: {selectedCell || "Yok"}
                    </Typography>
                </Box>
            </Paper>

            {/* Game Board */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#000', overflow: 'auto', p: 2 }}>
                <Box sx={{ border: '2px solid #666' }}>
                    {renderGrid()}
                </Box>
            </Box>

            {/* Request Dialog */}
            <Dialog open={!!requestDialog} onClose={() => { }}>
                <DialogTitle>Kapı Görme İsteği</DialogTitle>
                <Box sx={{ p: 2 }}>
                    Bir oyuncu seçtiğiniz odayı görmek istiyor. Onaylıyor musunuz?
                </Box>
                <DialogActions>
                    <Button onClick={() => handleRespondReveal(false)} color="secondary">Reddet</Button>
                    <Button onClick={() => handleRespondReveal(true)} autoFocus>Accept</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default GameRoom;
