import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  LocalOffer as LocalOfferIcon,
  Inventory as InventoryIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { MarketplaceItemFormData, UserRole } from '../types';
import Layout from '../components/layout/Layout';

const NewMarketplaceItemPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<MarketplaceItemFormData>({
    name: '',
    description: '',
    price: 0,
    quantity: 1,
    imageUrl: '',
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
  });

  useEffect(() => {
    // Redirect if not logged in or not an admin
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== UserRole.ADMIN) {
      navigate('/marketplace');
      return;
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs
    if (name === 'price' || name === 'quantity') {
      const numValue = name === 'price' ? parseFloat(value) : parseInt(value, 10);
      setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...formErrors };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
      isValid = false;
    }
    
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.marketplace.createMarketplaceItem(formData);
      navigate(`/marketplace/${response.data.id}`);
    } catch (err) {
      console.error('Error creating marketplace item:', err);
      setError('Failed to create marketplace item. Please try again.');
      setIsLoading(false);
    }
  };

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
          Add New Marketplace Item
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Create a new item to be listed in the marketplace.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper 
        component="form"
        onSubmit={handleSubmit}
        sx={{ 
          p: 3, 
          borderRadius: 2,
          boxShadow: theme.shadows[1],
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Item Name"
              fullWidth
              required
              value={formData.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              placeholder="Enter a name for the marketplace item"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <InventoryIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description"
              fullWidth
              required
              multiline
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              error={!!formErrors.description}
              helperText={formErrors.description}
              placeholder="Describe the item in detail"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="price"
              label="Price (Tokens)"
              type="number"
              fullWidth
              required
              value={formData.price}
              onChange={handleInputChange}
              error={!!formErrors.price}
              helperText={formErrors.price}
              inputProps={{ min: 1, step: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalOfferIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="quantity"
              label="Quantity Available"
              type="number"
              fullWidth
              required
              value={formData.quantity}
              onChange={handleInputChange}
              error={!!formErrors.quantity}
              helperText={formErrors.quantity}
              inputProps={{ min: 1, step: 1 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="imageUrl"
              label="Image URL"
              fullWidth
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              helperText="Link to an image for the marketplace item"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ImageIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          {formData.imageUrl && (
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  mt: 1, 
                  p: 2, 
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  textAlign: 'center',
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Image Preview
                </Typography>
                <Box 
                  component="img" 
                  src={formData.imageUrl} 
                  alt="Item preview" 
                  sx={{ 
                    maxWidth: '100%', 
                    maxHeight: 200, 
                    borderRadius: 1,
                  }} 
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                  }}
                />
              </Box>
            </Grid>
          )}
          
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{ 
                py: 1.5, 
                px: 4,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              {isLoading ? 'Creating...' : 'Create Marketplace Item'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Layout>
  );
};

export default NewMarketplaceItemPage;