import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VerifiedUser as VerifiedUserIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Contribution, ContributionStatus } from '../types';
import Layout from '../components/layout/Layout';

const ContributionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [contribution, setContribution] = useState<Contribution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchContribution(id);
    }
  }, [id]);

  const fetchContribution = async (contributionId: string) => {
    setIsLoading(true);
    try {
      const response = await api.contributions.getContribution(contributionId);
      setContribution(response.data);
    } catch (err) {
      console.error('Error fetching contribution:', err);
      setError('Failed to load contribution details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusChip = (status: ContributionStatus) => {
    switch (status) {
      case ContributionStatus.VERIFIED:
        return (
          <Chip 
            icon={<CheckCircleIcon />} 
            label="Verified" 
            color="success" 
            variant="outlined" 
          />
        );
      case ContributionStatus.PENDING:
        return (
          <Chip 
            icon={<PendingIcon />} 
            label="Pending Verification" 
            color="warning" 
            variant="outlined" 
          />
        );
      case ContributionStatus.REJECTED:
        return (
          <Chip 
            icon={<CancelIcon />} 
            label="Rejected" 
            color="error" 
            variant="outlined" 
          />
        );
      default:
        return null;
    }
  };

  const handleEdit = () => {
    navigate(`/contributions/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this contribution?')) {
      return;
    }
    
    try {
      await api.contributions.deleteContribution(id);
      navigate('/contributions');
    } catch (err) {
      console.error('Error deleting contribution:', err);
      setError('Failed to delete contribution. Please try again.');
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

  if (error) {
    return (
      <Layout>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/contributions')}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            Back to Contributions
          </Button>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Layout>
    );
  }

  if (!contribution) {
    return (
      <Layout>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/contributions')}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            Back to Contributions
          </Button>
          <Alert severity="warning">Contribution not found</Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/contributions')}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Back to Contributions
        </Button>
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {contribution.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {getStatusChip(contribution.status)}
              <Chip 
                icon={<CategoryIcon />} 
                label={contribution.sector.name} 
                variant="outlined" 
                sx={{ 
                  bgcolor: `${theme.palette.primary.main}10`,
                  color: theme.palette.primary.main,
                  borderColor: theme.palette.primary.main,
                }} 
              />
              <Chip 
                icon={<CalendarIcon />} 
                label={new Date(contribution.createdAt).toLocaleDateString()} 
                variant="outlined" 
                sx={{ color: 'text.secondary' }} 
              />
            </Box>
          </Box>
          
          {/* Action buttons */}
          {contribution.status === ContributionStatus.PENDING && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Edit Contribution">
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{ textTransform: 'none' }}
                >
                  Edit
                </Button>
              </Tooltip>
              <Tooltip title="Delete Contribution">
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  sx={{ textTransform: 'none' }}
                >
                  Delete
                </Button>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              mb: 3,
              boxShadow: theme.shadows[1],
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {contribution.description}
            </Typography>
            
            {contribution.evidenceUrl && (
              <>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                  Evidence
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <LinkIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography 
                    variant="body1" 
                    component="a" 
                    href={contribution.evidenceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ 
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    View Evidence
                  </Typography>
                </Box>
              </>
            )}
            
            {contribution.imageUrl && (
              <>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                  Images
                </Typography>
                <Box 
                  sx={{ 
                    mt: 2, 
                    p: 2, 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    textAlign: 'center',
                  }}
                >
                  <Box 
                    component="img" 
                    src={contribution.imageUrl} 
                    alt="Contribution evidence" 
                    sx={{ 
                      maxWidth: '100%', 
                      maxHeight: 400, 
                      borderRadius: 1,
                    }} 
                  />
                </Box>
              </>
            )}
          </Paper>

          {/* Verification Details (if verified) */}
          {contribution.status === ContributionStatus.VERIFIED && contribution.verificationDetails && (
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                boxShadow: theme.shadows[1],
                bgcolor: `${theme.palette.success.main}10`,
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <VerifiedUserIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                  Verification Details
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Verified By
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {contribution.verificationDetails.verifierName || 'Anonymous Verifier'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Verification Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {new Date(contribution.verificationDetails.verificationDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Verification Notes
                  </Typography>
                  <Typography variant="body1">
                    {contribution.verificationDetails.notes || 'No additional notes provided.'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Rejection Details (if rejected) */}
          {contribution.status === ContributionStatus.REJECTED && contribution.rejectionReason && (
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                boxShadow: theme.shadows[1],
                bgcolor: `${theme.palette.error.main}10`,
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <CancelIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                  Rejection Details
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1">
                {contribution.rejectionReason}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{ textTransform: 'none' }}
                >
                  Edit and Resubmit
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Status Card */}
          <Card 
            sx={{ 
              borderRadius: 2,
              mb: 3,
              background: theme.palette.customBackground.card,
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Contribution Status
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <CalendarIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Submitted On" 
                    secondary={new Date(contribution.createdAt).toLocaleDateString()} 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <CategoryIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sector" 
                    secondary={contribution.sector.name} 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {contribution.status === ContributionStatus.VERIFIED ? (
                      <CheckCircleIcon fontSize="small" color="success" />
                    ) : contribution.status === ContributionStatus.PENDING ? (
                      <PendingIcon fontSize="small" color="warning" />
                    ) : (
                      <CancelIcon fontSize="small" color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary="Status" 
                    secondary={
                      contribution.status === ContributionStatus.VERIFIED
                        ? 'Verified'
                        : contribution.status === ContributionStatus.PENDING
                        ? 'Pending Verification'
                        : 'Rejected'
                    } 
                  />
                </ListItem>
                {contribution.status === ContributionStatus.PENDING && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <AccessTimeIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Estimated Verification Time" 
                      secondary="1-3 business days" 
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Impact Card (if verified) */}
          {contribution.status === ContributionStatus.VERIFIED && contribution.impact && (
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                boxShadow: theme.shadows[1],
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Impact Generated
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  py: 2,
                }}
              >
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.info.main,
                    mb: 1,
                  }}
                >
                  {contribution.impact.value.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Impact Score
                </Typography>
              </Box>
              <Button
                fullWidth
                variant="outlined"
                color="info"
                onClick={() => navigate(`/impact/${contribution.impact.id}`)}
                sx={{ 
                  mt: 2, 
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                View Impact Details
              </Button>
            </Paper>
          )}

          {/* What's Next Card */}
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              mt: 3,
              boxShadow: theme.shadows[1],
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              What's Next?
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {contribution.status === ContributionStatus.VERIFIED ? (
              <>
                <Typography variant="body2" paragraph>
                  Your contribution has been verified! You've earned impact points and tokens for your positive impact.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/marketplace')}
                  sx={{ 
                    mt: 1, 
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  Explore Marketplace
                </Button>
              </>
            ) : contribution.status === ContributionStatus.PENDING ? (
              <>
                <Typography variant="body2" paragraph>
                  Your contribution is currently under review by our verifiers. You'll be notified once the verification process is complete.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/contributions/new')}
                  sx={{ 
                    mt: 1, 
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  Add Another Contribution
                </Button>
              </>
            ) : (
              <>
                <Typography variant="body2" paragraph>
                  Your contribution was rejected. Please review the rejection reason, make necessary changes, and resubmit.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{ 
                    mt: 1, 
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  Edit and Resubmit
                </Button>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default ContributionDetailPage;