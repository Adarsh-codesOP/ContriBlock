import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Divider,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  LocalOffer as LocalOfferIcon,
  Inventory as InventoryIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { MarketplaceItem } from '../types';
import Layout from '../components/layout/Layout';

const MarketplaceItemPage = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (id) {
      fetchItem(id);
    }
  }, [id, user, navigate]);

  const fetchItem = async (itemId: string) => {
    try {
      setIsLoading(true);
      const response = await api.marketplace.getMarketplaceItem(itemId);
      setItem(response.data);
    } catch (err) {
      console.error('Error fetching marketplace item:', err);
      setError('Failed to load marketplace item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseClick = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (!item || !user) return;
    
    setConfirmDialogOpen(false);
    setIsPurchasing(true);
    setError(null);

    try {
      await api.marketplace.purchaseItem(item.id);
      setPurchaseSuccess(true);
      setSuccessDialogOpen(true);
      // Refresh user data to update token balance
      await api.users.getCurrentUser();
    } catch (err: any) {
      console.error('Error purchasing item:', err);
      if (err.response?.status === 400 && err.response?.data?.message?.includes('insufficient')) {
        setError('You don\'t have enough tokens to purchase this item.');
      } else {
        setError('Failed to purchase item. Please try again.');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
    navigate('/marketplace');
  };

  if (isLoading) {
    return (
      <Layout>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 'calc(100vh - 64px)' 
          }}
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!item && !isLoading) {
    return (
      <Layout>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/marketplace')}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            Back to Marketplace
          </Button>
          
          <Alert severity="error">
            Item not found or has been removed from the marketplace.
          </Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/marketplace')}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Back to Marketplace
        </Button>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      </Box>

      {item && (
        <Grid container spacing={4}>
          {/* Item Image */}
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: theme.shadows[1],
              }}
            >
              {item.imageUrl ? (
                <Box 
                  component="img" 
                  src={item.imageUrl} 
                  alt={item.name}
                  sx={{ 
                    width: '100%',
                    height: 'auto',
                    maxHeight: 400,
                    objectFit: 'contain',
                    borderRadius: 1,
                  }} 
                />
              ) : (
                <Box 
                  sx={{ 
                    width: '100%',
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    borderRadius: 1,
                  }}
                >
                  <InventoryIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5 }} />
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* Item Details */}
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: theme.shadows[1],
              }}
            >
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                  {item.name}
                </Typography>
                <Chip 
                  icon={<LocalOfferIcon />} 
                  label={`${item.price} Tokens`} 
                  color="primary" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    height: 36,
                  }} 
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <DescriptionIcon sx={{ mr: 1 }} /> Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {item.description}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Quantity Available
                </Typography>
                <Typography variant="body1">
                  {item.quantity > 0 ? item.quantity : 'Out of stock'}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 'auto', pt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  startIcon={purchaseSuccess ? <CheckCircleIcon /> : <ShoppingCartIcon />}
                  onClick={handlePurchaseClick}
                  disabled={isPurchasing || purchaseSuccess || item.quantity <= 0 || (user && user.tokenBalance < item.price)}
                  sx={{ 
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  {isPurchasing ? (
                    <>
                      <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                      Processing...
                    </>
                  ) : purchaseSuccess ? (
                    'Purchased Successfully'
                  ) : item.quantity <= 0 ? (
                    'Out of Stock'
                  ) : (user && user.tokenBalance < item.price) ? (
                    'Insufficient Tokens'
                  ) : (
                    `Purchase for ${item.price} Tokens`
                  )}
                </Button>
                
                {user && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    Your current balance: <strong>{user.tokenBalance} Tokens</strong>
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Purchase</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to purchase <strong>{item?.name}</strong> for <strong>{item?.price} Tokens</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmPurchase} color="primary" variant="contained" autoFocus>
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={handleCloseSuccessDialog}
      >
        <DialogTitle>Purchase Successful!</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
            <DialogContentText align="center">
              You have successfully purchased <strong>{item?.name}</strong>.
              <br /><br />
              Your new token balance: <strong>{user ? user.tokenBalance - (item?.price || 0) : 0} Tokens</strong>
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} color="primary" variant="contained" autoFocus>
            Back to Marketplace
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default MarketplaceItemPage;