import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Button, List, ListItem,
    ListItemText, ListItemAvatar, Avatar, Paper, Dialog, DialogTitle, DialogActions
} from '@mui/material';
import { ref, onValue, update, remove, push, set } from "firebase/database";
import { db } from '../firebase';

function GameRoom() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const [roomData, setRoomData] = useState(null);
    const [players, setPlayers] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null);

    // Requests: We listen to rooms/password/requests
    const [requestDialog, setRequestDialog] = useState(null);

    const password = state?.password;
    const myPlayerId = state?.myPlayerId;
    const isHost = state?.isHost;

    useEffect(() => {
        if (!password || !myPlayerId) {
            navigate('/');
            return;
        }

        const roomRef = ref(db, 'rooms/' + password);

        const unsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                // Room deleted
                alert("Oyun sonlandırıldı.");
                navigate('/');
                return;
            }
            setRoomData(data);

            // Convert players object to array
            const playersList = data.players ? Object.values(data.players) : [];
            setPlayers(playersList);

            // Check Requests targeting ME
            if (data.requests) {
                Object.entries(data.requests).forEach(([reqKey, reqVal]) => {
                    if (reqVal.to === myPlayerId && reqVal.status === 'pending') {
                        setRequestDialog({ ...reqVal, key: reqKey });
                    }
                });
            }
        });

        return () => unsubscribe();
    }, [password, myPlayerId, navigate]);

    const handleStartGame = () => {
        update(ref(db, 'rooms/' + password), { isStarted: true });
    };

    const handleEndGame = () => {
        if (confirm("Oyunu bitirmek istediğinize emin misiniz?")) {
            remove(ref(db, 'rooms/' + password));
        }
    };

    const handleSelectCell = (cellId) => {
        if (selectedCell === cellId) return;
        if (!myPlayerId) return;
        setSelectedCell(cellId);
        // Update my selected cell
        update(ref(db, `rooms/${password}/players/${myPlayerId}`), { selectedCell: cellId });
    };

    const handleExitRoom = () => {
        setSelectedCell(null);
        update(ref(db, `rooms/${password}/players/${myPlayerId}`), { selectedCell: "" });
    };

    const handleRequestReveal = (targetPlayerId) => {
        if (targetPlayerId === myPlayerId) return;
        push(ref(db, `rooms/${password}/requests`), {
            from: myPlayerId,
            to: targetPlayerId,
            status: 'pending'
        });
        alert("İstek gönderildi.");
    };

    const handleRespondReveal = (accepted) => {
        if (requestDialog) {
            // Update request status
            const reqRef = ref(db, `rooms/${password}/requests/${requestDialog.key}`);
            update(reqRef, { status: accepted ? 'accepted' : 'rejected' });

            if (accepted) {
                // Grant permission: Add requester to my revealedTo list
                // storing as { requesterId: true }
                update(ref(db, `rooms/${password}/players/${myPlayerId}/revealedTo`), {
                    [requestDialog.from]: true
                });
            }

            setRequestDialog(null);
        }
    };

    // Logic to determine what I can see
    // I can see my cell.
    // I can see cell of players who have ME in their 'revealedTo' list.

    const getVisibleCell = (player) => {
        if (player.id === myPlayerId) return selectedCell; // Local state for immediate feedback
        // Check if player revealed to me
        if (player.revealedTo && player.revealedTo[myPlayerId]) {
            return player.selectedCell;
        }
        return null;
    };

    const rows = 19;
    const cols = 21;
    const renderGrid = () => {
        const grid = [];
        for (let r = 0; r < rows; r++) {
            const rowCells = [];
            for (let c = 0; c < cols; c++) {
                const cellId = `${r}-${c}`;

                // Find players on this cell THAT I CAN SEE
                const occupants = players.filter(p => {
                    const visibleCell = getVisibleCell(p);
                    return visibleCell === cellId;
                });

                const isMySelection = selectedCell === cellId;

                rowCells.push(
                    <Box
                        key={cellId}
                        onClick={() => handleSelectCell(cellId)}
                        sx={{
                            width: 30,
                            height: 30,
                            border: '1px solid #444',
                            bgcolor: isMySelection ? 'primary.main' : 'background.paper',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            '&:hover': { bgcolor: 'action.hover' }
                        }}
                    >
                        {occupants.map((p, i) => (
                            <Box key={p.id} sx={{
                                width: 10, height: 10,
                                borderRadius: '50%',
                                bgcolor: p.color || 'white',
                                position: 'absolute',
                                left: i * 5 // stacking offset
                            }} />
                        ))}
                    </Box>
                );
            }
            grid.push(<Box key={r} sx={{ display: 'flex' }}>{rowCells}</Box>);
        }
        return grid;
    };

    if (!roomData) return <Typography>Yükleniyor...</Typography>;

    if (!roomData.isStarted) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>Lobi: {roomData.gameName}</Typography>
                <Typography variant="subtitle1">Şifre: {password}</Typography>
                <Box sx={{ my: 4 }}>
                    <Typography variant="h6">Oyuncular ({players.length})</Typography>
                    <List>
                        {players.map((p) => (
                            <ListItem key={p.id}>
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: p.color || '#ccc' }}>{p.name ? p.name[0] : '?'}</Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={p.name} secondary={p.id === roomData.hostId ? 'Host' : 'Oyuncu'} />
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
                    {players.map((p) => {
                        const isVisible = (p.revealedTo && p.revealedTo[myPlayerId]);
                        return (
                            <ListItem
                                key={p.id}
                                button
                                onClick={() => handleRequestReveal(p.id)}
                                disabled={p.id === myPlayerId}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: p.color || '#ccc' }}>{p.name ? p.name[0] : '?'}</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={p.name}
                                    secondary={p.id === myPlayerId ? "Siz" : (isVisible ? "Görünür" : "Gizli")}
                                />
                            </ListItem>
                        )
                    })}
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
