import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  Stack,
} from '@mui/material';
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import MetaMaskPrompt from '../components/wallet/MetaMaskPrompt';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, isLoading, error: authError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Get the location the user was trying to access before being redirected to login
  const from = (location.state as LocationState)?.from?.pathname || '/dashboard';

  useEffect(() => {
    // If user is already authenticated, redirect to the intended destination
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleConnect = async () => {
    setError(null);
    setIsConnecting(true);
    
    try {
      await login();
      // The useEffect above will handle the redirect once user is set
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Check if MetaMask is not installed based on error from AuthContext
  const isMetaMaskNotInstalled = authError === 'metamask_not_installed';
  const isNotMetaMask = authError === 'not_metamask';

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.palette.customBackground.gradient,
        py: 8,
      }}
    >
      <Container maxWidth="sm">
        {isMetaMaskNotInstalled ? (
          <MetaMaskPrompt />
        ) : isNotMetaMask ? (
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 3,
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <Alert severity="warning" sx={{ mb: 3 }}>
              Please use MetaMask as your wallet provider. Other wallets may not be fully compatible with our platform.
            </Alert>
            <MetaMaskPrompt />
          </Paper>
        ) : (
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 3,
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <Box textAlign="center" mb={4}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                Welcome to ContriBlock
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Connect your wallet to access the platform
              </Typography>
            </Box>

            {error && error !== 'metamask_not_installed' && error !== 'not_metamask' && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Stack spacing={3}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<WalletIcon />}
                onClick={handleConnect}
                disabled={isConnecting}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {isConnecting ? 'Connecting...' : 'Connect with MetaMask'}
              </Button>

              <Typography variant="body2" color="text.secondary" textAlign="center">
                By connecting your wallet, you agree to our{' '}
                <Typography
                  component="span"
                  variant="body2"
                  color="primary"
                  sx={{ cursor: 'pointer', fontWeight: 500 }}
                  onClick={() => navigate('/terms')}
                >
                  Terms of Service
                </Typography>{' '}
                and{' '}
                <Typography
                  component="span"
                  variant="body2"
                  color="primary"
                  sx={{ cursor: 'pointer', fontWeight: 500 }}
                  onClick={() => navigate('/privacy')}
                >
                  Privacy Policy
                </Typography>
              </Typography>
            </Stack>
          </Paper>
        )}

        {!isMetaMaskNotInstalled && !isNotMetaMask && (
          <Box mt={4} textAlign="center">
            <Typography variant="body2" color="white">
              Don't have a wallet?{' '}
              <Typography
                component="span"
                variant="body2"
                color="secondary"
                sx={{ cursor: 'pointer', fontWeight: 500 }}
                onClick={() => window.open('https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn', '_blank')}
              >
                Get MetaMask
              </Typography>
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default LoginPage;