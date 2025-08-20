import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Divider,
  Alert,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
  useTheme,
  Pagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ShoppingCart as ShoppingCartIcon,
  Token as TokenIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Sort as SortIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { MarketplaceItem, Purchase, UserRole } from '../types';
import Layout from '../components/layout/Layout';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`marketplace-tabpanel-${index}`}
      aria-labelledby={`marketplace-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `marketplace-tab-${index}`,
    'aria-controls': `marketplace-tabpanel-${index}`,
  };
}

const MarketplacePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [userPurchases, setUserPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterByPrice, setFilterByPrice] = useState('all');

  const itemsPerPage = 8;

  useEffect(() => {
    if (tabValue === 0) {
      fetchMarketplaceItems();
    } else {
      fetchUserPurchases();
    }
  }, [tabValue, page, sortBy, filterByPrice]);

  const fetchMarketplaceItems = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, these parameters would be passed to the API
      const response = await api.marketplace.getMarketplaceItems(page, itemsPerPage, sortBy, filterByPrice, searchQuery);
      if (response && response.items) {
        setMarketplaceItems(response.items);
        setTotalPages(Math.ceil(response.total / itemsPerPage));
      } else {
        // Handle case where response doesn't have expected structure
        setMarketplaceItems([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching marketplace items:', err);
      setError('Failed to load marketplace items. Please try again.');
      setMarketplaceItems([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPurchases = async () => {
    setIsLoading(true);
    try {
      const response = await api.marketplace.getUserPurchases();
      setUserPurchases(response.data);
    } catch (err) {
      console.error('Error fetching user purchases:', err);
      setError('Failed to load purchase history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchMarketplaceItems();
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
    setPage(1); // Reset to first page on sort change
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilterByPrice(event.target.value);
    setPage(1); // Reset to first page on filter change
  };

  const handlePurchaseClick = (item: MarketplaceItem) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.tokenBalance < item.price) {
      setError('Insufficient tokens. Earn more by contributing!');
      return;
    }

    setSelectedItem(item);
    setPurchaseDialogOpen(true);
  };

  const handlePurchaseConfirm = async () => {
    if (!selectedItem) return;

    setIsPurchasing(true);
    try {
      await api.marketplace.purchaseItem(selectedItem.id);
      setSuccessMessage(`Successfully purchased ${selectedItem.name}!`);
      // Refresh user data to update token balance
      await api.users.getCurrentUser();
      // Refresh marketplace items
      fetchMarketplaceItems();
    } catch (err) {
      console.error('Error purchasing item:', err);
      setError('Failed to complete purchase. Please try again.');
    } finally {
      setIsPurchasing(false);
      setPurchaseDialogOpen(false);
    }
  };

  const handleAddNewItem = () => {
    navigate('/marketplace/new');
  };

  if (isLoading && marketplaceItems.length === 0 && userPurchases.length === 0) {
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
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Marketplace
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Browse and purchase items using your earned tokens.
          </Typography>
        </Box>
        
        {user && (user.role === UserRole.ADMIN) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNewItem}
            sx={{ textTransform: 'none' }}
          >
            Add New Item
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}

      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="marketplace tabs"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                minWidth: 100,
              },
            }}
          >
            <Tab 
              icon={<ShoppingCartIcon />} 
              iconPosition="start" 
              label="Available Items" 
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<HistoryIcon />} 
              iconPosition="start" 
              label="Purchase History" 
              {...a11yProps(1)} 
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {/* Search and Filter Bar */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 3,
            }}
          >
            <Box 
              component="form" 
              onSubmit={handleSearch}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <TextField
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ width: { xs: '100%', sm: 300 } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton type="submit" edge="end">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 2,
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="sort-select-label">Sort By</InputLabel>
                <Select
                  labelId="sort-select-label"
                  value={sortBy}
                  label="Sort By"
                  onChange={handleSortChange}
                  startAdornment={<SortIcon fontSize="small" sx={{ mr: 1, ml: -0.5 }} />}
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="price_low">Price: Low to High</MenuItem>
                  <MenuItem value="price_high">Price: High to Low</MenuItem>
                  <MenuItem value="name_asc">Name: A to Z</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="filter-select-label">Price Range</InputLabel>
                <Select
                  labelId="filter-select-label"
                  value={filterByPrice}
                  label="Price Range"
                  onChange={handleFilterChange}
                  startAdornment={<FilterListIcon fontSize="small" sx={{ mr: 1, ml: -0.5 }} />}
                >
                  <MenuItem value="all">All Prices</MenuItem>
                  <MenuItem value="under_50">Under 50 Tokens</MenuItem>
                  <MenuItem value="50_100">50-100 Tokens</MenuItem>
                  <MenuItem value="over_100">Over 100 Tokens</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Marketplace Items Grid */}
          {marketplaceItems.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {marketplaceItems.map((item) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderRadius: 2,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[4],
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="180"
                        image={item.imageUrl || 'https://via.placeholder.com/300x180?text=Item+Image'}
                        alt={item.name}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {item.description}
                        </Typography>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            mt: 'auto',
                          }}
                        >
                          <TokenIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                          <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
                            {item.price.toFixed(2)}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handlePurchaseClick(item)}
                          disabled={user?.tokenBalance < item.price}
                          sx={{ 
                            textTransform: 'none',
                            borderRadius: 2,
                          }}
                        >
                          {user?.tokenBalance < item.price ? 'Insufficient Tokens' : 'Purchase'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {totalPages > 1 && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    mt: 4,
                  }}
                >
                  <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={handlePageChange} 
                    color="primary" 
                  />
                </Box>
              )}
            </>
          ) : (
            <Paper 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" paragraph>
                No items found in the marketplace.
              </Typography>
              {user && (user.role === UserRole.ADMIN) && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddNewItem}
                  sx={{ textTransform: 'none' }}
                >
                  Add First Item
                </Button>
              )}
            </Paper>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {userPurchases.length > 0 ? (
            <Grid container spacing={3}>
              {userPurchases.map((purchase) => (
                <Grid item xs={12} sm={6} md={4} key={purchase.id}>
                  <Card 
                    sx={{ 
                      borderRadius: 2,
                      boxShadow: theme.shadows[1],
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={purchase.item.imageUrl || 'https://via.placeholder.com/300x140?text=Item+Image'}
                      alt={purchase.item.name}
                    />
                    <CardContent>
                      <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                        {purchase.item.name}
                      </Typography>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Purchase Date
                        </Typography>
                        <Typography variant="body2">
                          {new Date(purchase.purchaseDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Price
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TokenIcon sx={{ color: theme.palette.success.main, mr: 0.5, fontSize: 16 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                            {purchase.price.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    {purchase.redeemCode && (
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Box 
                          sx={{ 
                            width: '100%', 
                            p: 1.5, 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                            borderRadius: 1,
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Redemption Code
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                            {purchase.redeemCode}
                          </Typography>
                        </Box>
                      </CardActions>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" paragraph>
                You haven't made any purchases yet.
              </Typography>
              <Button
                variant="contained"
                onClick={() => setTabValue(0)}
                sx={{ textTransform: 'none' }}
              >
                Browse Marketplace
              </Button>
            </Paper>
          )}
        </TabPanel>
      </Box>

      {/* Purchase Confirmation Dialog */}
      <Dialog
        open={purchaseDialogOpen}
        onClose={() => setPurchaseDialogOpen(false)}
      >
        <DialogTitle>Confirm Purchase</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to purchase {selectedItem?.name} for {selectedItem?.price.toFixed(2)} tokens?
          </DialogContentText>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mt: 2,
              p: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Your Current Balance:
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                ml: 'auto',
              }}
            >
              <TokenIcon sx={{ color: theme.palette.success.main, mr: 0.5 }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                {user?.tokenBalance.toFixed(2)}
              </Typography>
            </Box>
          </Box>
          {selectedItem && user && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mt: 1,
                p: 2,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Balance After Purchase:
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  ml: 'auto',
                }}
              >
                <TokenIcon sx={{ color: theme.palette.success.main, mr: 0.5 }} />
                <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                  {(user.tokenBalance - selectedItem.price).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handlePurchaseConfirm} 
            color="primary"
            variant="contained"
            disabled={isPurchasing}
            autoFocus
          >
            {isPurchasing ? <CircularProgress size={24} /> : 'Confirm Purchase'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default MarketplacePage;