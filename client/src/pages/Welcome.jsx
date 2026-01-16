import React from 'react';
import { Button, Container, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Welcome() {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm">
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                gap: 4
            }}>
                <Typography variant="h2" component="h1" gutterBottom align="center">
                    Mystery Grid Game
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        size="large"
                        color="primary"
                        onClick={() => navigate('/host')}
                        sx={{ fontSize: '1.2rem', padding: '15px 40px' }}
                    >
                        Host Game
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        color="secondary"
                        onClick={() => navigate('/join')}
                        sx={{ fontSize: '1.2rem', padding: '15px 40px' }}
                    >
                        Join Game
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default Welcome;
