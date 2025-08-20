import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Link,
  Stack,
  useTheme,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

interface MetaMaskPromptProps {
  onClose?: () => void;
}

const METAMASK_CHROME_STORE_URL = 'https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn';

const MetaMaskPrompt: React.FC<MetaMaskPromptProps> = ({ onClose }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        borderRadius: 2,
        maxWidth: 500,
        mx: 'auto',
        backdropFilter: 'blur(10px)',
        background: 'rgba(255, 255, 255, 0.95)',
      }}
    >
      <Stack spacing={3} alignItems="center">
        <Typography variant="h5" component="h2" fontWeight="bold" textAlign="center">
          MetaMask Required
        </Typography>

        <Box 
          component="img" 
          src="/metamask-fox.svg" 
          alt="MetaMask Logo" 
          sx={{ 
            width: 100, 
            height: 100,
            filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))'
          }}
        />

        <Typography variant="body1" textAlign="center">
          To use ContriBlock, you need to install the MetaMask browser extension. 
          MetaMask allows you to securely connect your Ethereum wallet to our platform.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          startIcon={<DownloadIcon />}
          onClick={() => window.open(METAMASK_CHROME_STORE_URL, '_blank')}
          sx={{
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
          }}
        >
          Install MetaMask Extension
        </Button>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          After installing, please refresh this page to continue.
          {onClose && (
            <Link
              component="button"
              variant="body2"
              onClick={onClose}
              sx={{ ml: 1, cursor: 'pointer' }}
            >
              I already have MetaMask
            </Link>
          )}
        </Typography>
      </Stack>
    </Paper>
  );
};

export default MetaMaskPrompt;