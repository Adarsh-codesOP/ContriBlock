import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Verified as VerifiedIcon,
  Nature as EcoIcon, // Using Nature icon instead of Eco
  Token as TokenIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Devices as DevicesIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, connectWallet } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const features = [
    {
      title: 'Verified Contributions',
      description: 'All contributions are verified by trusted verifiers to ensure authenticity and impact.',
      icon: <VerifiedIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />,
    },
    {
      title: 'Environmental Impact',
      description: 'Track and showcase your positive impact on the environment and society.',
      icon: <EcoIcon fontSize="large" sx={{ color: theme.palette.success.main }} />,
    },
    {
      title: 'Tokenized Rewards',
      description: 'Earn tokens for your verified contributions that can be traded in the marketplace.',
      icon: <TokenIcon fontSize="large" sx={{ color: theme.palette.secondary.main }} />,
    },
    {
      title: 'Blockchain Security',
      description: 'All data is secured using blockchain technology for transparency and immutability.',
      icon: <SecurityIcon fontSize="large" sx={{ color: theme.palette.info.main }} />,
    },
    {
      title: 'Fast Verification',
      description: 'Quick verification process to validate your contributions and issue rewards.',
      icon: <SpeedIcon fontSize="large" sx={{ color: theme.palette.warning.main }} />,
    },
    {
      title: 'Cross-Platform',
      description: 'Access ContriBlock from any device with our responsive web application.',
      icon: <DevicesIcon fontSize="large" sx={{ color: theme.palette.error.main }} />,
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: theme.palette.customBackground.gradient,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                }}
              >
                Verify, Impact, Earn
              </Typography>
              <Typography 
                variant="h5" 
                paragraph 
                sx={{ 
                  mb: 4, 
                  opacity: 0.9,
                  maxWidth: '90%',
                  fontWeight: 400,
                }}
              >
                A blockchain-based platform for verifying contributions, tracking impact, and earning rewards.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {user ? (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/dashboard')}
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                    }}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleConnect}
                    disabled={isConnecting}
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                    }}
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/about')}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Learn More
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                sx={{
                  position: 'relative',
                  height: '400px',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {/* This would be replaced with an actual image or illustration */}
                <Box
                  sx={{
                    width: '80%',
                    height: '80%',
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
                    ContriBlock
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Key Features
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            ContriBlock offers a comprehensive platform for managing and verifying contributions with blockchain technology.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 3,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                  },
                }}
                elevation={2}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography gutterBottom variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              How It Works
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              ContriBlock simplifies the process of verifying contributions and earning rewards.
            </Typography>
          </Box>

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: '400px',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 4,
                }}
              >
                {/* This would be replaced with an actual image or illustration */}
                <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Process Illustration
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <Box 
                      component="span" 
                      sx={{ 
                        mr: 2, 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 36, 
                        height: 36, 
                        borderRadius: '50%', 
                        bgcolor: theme.palette.primary.main, 
                        color: 'white',
                        fontWeight: 700,
                      }}
                    >
                      1
                    </Box>
                    Connect Your Wallet
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Start by connecting your Ethereum wallet to authenticate and interact with the platform.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <Box 
                      component="span" 
                      sx={{ 
                        mr: 2, 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 36, 
                        height: 36, 
                        borderRadius: '50%', 
                        bgcolor: theme.palette.primary.main, 
                        color: 'white',
                        fontWeight: 700,
                      }}
                    >
                      2
                    </Box>
                    Submit Contributions
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Document your contributions with details and evidence for verification.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <Box 
                      component="span" 
                      sx={{ 
                        mr: 2, 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 36, 
                        height: 36, 
                        borderRadius: '50%', 
                        bgcolor: theme.palette.primary.main, 
                        color: 'white',
                        fontWeight: 700,
                      }}
                    >
                      3
                    </Box>
                    Get Verified
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Trusted verifiers review and approve your contributions based on evidence.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <Box 
                      component="span" 
                      sx={{ 
                        mr: 2, 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 36, 
                        height: 36, 
                        borderRadius: '50%', 
                        bgcolor: theme.palette.primary.main, 
                        color: 'white',
                        fontWeight: 700,
                      }}
                    >
                      4
                    </Box>
                    Earn Rewards
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Receive tokens for verified contributions that can be used in the marketplace.
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: theme.palette.customBackground.gradient,
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" paragraph sx={{ mb: 4, opacity: 0.9, maxWidth: 700, mx: 'auto' }}>
            Join ContriBlock today and start verifying your contributions, tracking your impact, and earning rewards.
          </Typography>
          <Button
            variant="contained"
            size="large"
            color="secondary"
            onClick={user ? () => navigate('/dashboard') : handleConnect}
            sx={{ 
              px: 4, 
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0 4px 14px 0 rgba(255,171,0,0.39)',
            }}
          >
            {user ? 'Go to Dashboard' : 'Connect Wallet'}
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                ContriBlock
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                A blockchain-based platform for verifying contributions, tracking impact, and earning rewards.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Links
              </Typography>
              <Stack spacing={1}>
                {['About', 'Features', 'How It Works', 'FAQ', 'Contact'].map((item) => (
                  <Typography 
                    key={item} 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { color: theme.palette.primary.main },
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Legal
              </Typography>
              <Stack spacing={1}>
                {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Disclaimer'].map((item) => (
                  <Typography 
                    key={item} 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { color: theme.palette.primary.main },
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} ContriBlock. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;