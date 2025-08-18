import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  useTheme,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountBalanceWallet as WalletIcon,
  VerifiedUser as VerifiedIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { KycStatus, UserRole } from '../types';
import Layout from '../components/layout/Layout';

const ProfilePage = () => {
  const theme = useTheme();
  const { user, refreshUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing, reset form
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      await api.users.updateUserInfo(formData);
      await refreshUser();
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(null);
    setError(null);
  };

  const getKycStatusChip = (status: KycStatus) => {
    switch (status) {
      case KycStatus.VERIFIED:
        return (
          <Chip 
            icon={<VerifiedIcon />} 
            label="Verified" 
            color="success" 
            size="small" 
            variant="outlined" 
          />
        );
      case KycStatus.PENDING:
        return (
          <Chip 
            label="Pending Verification" 
            color="warning" 
            size="small" 
            variant="outlined" 
          />
        );
      case KycStatus.UNVERIFIED:
        return (
          <Chip 
            label="Unverified" 
            color="default" 
            size="small" 
            variant="outlined" 
          />
        );
      default:
        return null;
    }
  };

  const getRoleChip = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return (
          <Chip 
            label="Admin" 
            color="error" 
            size="small" 
            variant="outlined" 
            sx={{ ml: 1 }}
          />
        );
      case UserRole.VERIFIER:
        return (
          <Chip 
            label="Verifier" 
            color="info" 
            size="small" 
            variant="outlined" 
            sx={{ ml: 1 }}
          />
        );
      case UserRole.USER:
        return (
          <Chip 
            label="User" 
            color="primary" 
            size="small" 
            variant="outlined" 
            sx={{ ml: 1 }}
          />
        );
      default:
        return null;
    }
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
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your profile information
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              boxShadow: theme.shadows[1],
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Profile Information
              </Typography>
              <Button
                startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
                onClick={handleEditToggle}
                color={isEditing ? 'error' : 'primary'}
                variant="outlined"
                sx={{ textTransform: 'none' }}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    multiline
                    rows={4}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                  />
                </Grid>
                {isEditing && (
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={isSaving}
                      sx={{ 
                        mt: 2, 
                        textTransform: 'none',
                        borderRadius: 2,
                      }}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Profile Summary */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              borderRadius: 2,
              mb: 3,
              background: theme.palette.customBackground.card,
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '2rem',
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : user?.wallet.charAt(2).toUpperCase()}
              </Avatar>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {user?.name || 'Anonymous User'}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                {user && getKycStatusChip(user.kycStatus)}
                {user && getRoleChip(user.role)}
              </Box>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <WalletIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {user?.wallet.substring(0, 6)}...{user?.wallet.substring(user.wallet.length - 4)}
                </Typography>
              </Box>
              {user?.bio && (
                <Typography variant="body2" color="text.secondary">
                  {user.bio}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              boxShadow: theme.shadows[1],
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Account Statistics
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Member Since
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Token Balance
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: theme.palette.secondary.main }}>
                  {user?.tokenBalance || 0}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Contributions
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {user?.contributionCount || 0}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Impact Score
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: theme.palette.info.main }}>
                  {user?.impactScore?.toFixed(2) || '0.00'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default ProfilePage;