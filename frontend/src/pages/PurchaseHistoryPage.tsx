import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ShoppingBag as ShoppingBagIcon,
  CalendarToday as CalendarTodayIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Purchase } from '../types';
import Layout from '../components/layout/Layout';

const PurchaseHistoryPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchPurchases();
  }, [user, navigate]);

  const fetchPurchases = async () => {
    try {
      setIsLoading(true);
      const response = await api.marketplace.getPurchaseHistory();
      setPurchases(response.data);
    } catch (err) {
      console.error('Error fetching purchase history:', err);
      setError('Failed to load purchase history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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
        
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          <ShoppingBagIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
          Purchase History
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          View your past purchases from the marketplace.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper 
        sx={{ 
          p: 0, 
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: theme.shadows[1],
        }}
      >
        {purchases.length === 0 ? (
          <Box 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            <ShoppingBagIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Purchase History
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              You haven't made any purchases from the marketplace yet.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/marketplace')}
              sx={{ textTransform: 'none' }}
            >
              Browse Marketplace
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Purchase Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchases
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((purchase) => (
                      <TableRow key={purchase.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {purchase.item.imageUrl ? (
                              <Box 
                                component="img" 
                                src={purchase.item.imageUrl} 
                                alt={purchase.item.name}
                                sx={{ 
                                  width: 40, 
                                  height: 40, 
                                  borderRadius: 1,
                                  mr: 2,
                                  objectFit: 'cover',
                                }} 
                              />
                            ) : (
                              <Box 
                                sx={{ 
                                  width: 40, 
                                  height: 40, 
                                  borderRadius: 1,
                                  mr: 2,
                                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <ShoppingBagIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                              </Box>
                            )}
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {purchase.item.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            icon={<LocalOfferIcon />} 
                            label={`${purchase.item.price} Tokens`} 
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            {formatDate(purchase.purchaseDate)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/marketplace/${purchase.item.id}`)}
                            sx={{ textTransform: 'none' }}
                          >
                            View Item
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={purchases.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Paper 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            boxShadow: theme.shadows[1],
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            About Marketplace Purchases
          </Typography>
          <Typography variant="body2" paragraph>
            Items purchased from the marketplace are non-refundable. If you encounter any issues with your purchase, please contact our support team.
          </Typography>
          <Typography variant="body2">
            Your token balance: <strong>{user?.tokenBalance || 0} Tokens</strong>
          </Typography>
        </Paper>
      </Box>
    </Layout>
  );
};

export default PurchaseHistoryPage;