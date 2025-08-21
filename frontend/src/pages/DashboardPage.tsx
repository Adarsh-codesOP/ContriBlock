import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  CircularProgress,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
} from '@mui/material';
import {
  AddCircleOutline as AddIcon,
  VerifiedUser as VerifiedIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Contribution, ContributionStatus, Impact } from '../types';
import Layout from '../components/layout/Layout';

const DashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [impacts, setImpacts] = useState<Impact[]>([]);
  const [stats, setStats] = useState({
    totalContributions: 0,
    verifiedContributions: 0,
    pendingContributions: 0,
    totalImpact: 0,
    tokenBalance: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch user's contributions
        const contributionsResponse = await api.contributions.getUserContributions();
        console.log('Contributions response:', contributionsResponse);
        const contributionsData = Array.isArray(contributionsResponse) ? contributionsResponse : [];
        setContributions(contributionsData.slice(0, 5)); // Get latest 5
        
        // Fetch user's impact records
        const impactsResponse = await api.impact.getUserImpact();
        console.log('Impacts response:', impactsResponse);
        const impactsData = Array.isArray(impactsResponse) ? impactsResponse : [];
        setImpacts(impactsData.slice(0, 5)); // Get latest 5
        
        // Calculate stats
        const allContributions = contributionsData;
        const verifiedCount = allContributions.filter(
          (c: Contribution) => c.status === ContributionStatus.APPROVED
        ).length;
        const pendingCount = allContributions.filter(
          (c: Contribution) => c.status === ContributionStatus.PENDING
        ).length;
        
        // Calculate total impact (this would depend on your impact metrics)
        const totalImpactValue = impactsData.reduce(
          (sum: number, impact: Impact) => sum + (impact.value || 0),
          0
        );
        
        // Set stats
        setStats({
          totalContributions: allContributions.length,
          verifiedContributions: verifiedCount,
          pendingContributions: pendingCount,
          totalImpact: totalImpactValue,
          tokenBalance: user?.tokenBalance || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty arrays to prevent undefined errors
        setContributions([]);
        setImpacts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getStatusIcon = (status: ContributionStatus) => {
    switch (status) {
      case ContributionStatus.APPROVED:
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case ContributionStatus.PENDING:
        return <PendingIcon sx={{ color: theme.palette.warning.main }} />;
      case ContributionStatus.REJECTED:
        return <CancelIcon sx={{ color: theme.palette.error.main }} />;
      default:
        return null;
    }
  };

  const getStatusChip = (status: ContributionStatus) => {
    switch (status) {
      case ContributionStatus.APPROVED:
        return (
          <Chip 
            label="Approved" 
            size="small" 
            icon={<CheckCircleIcon />} 
            color="success" 
            variant="outlined" 
          />
        );
      case ContributionStatus.PENDING:
        return (
          <Chip 
            label="Pending" 
            size="small" 
            icon={<PendingIcon />} 
            color="warning" 
            variant="outlined" 
          />
        );
      case ContributionStatus.REJECTED:
        return (
          <Chip 
            label="Rejected" 
            size="small" 
            icon={<CancelIcon />} 
            color="error" 
            variant="outlined" 
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
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.name || 'User'}! Here's an overview of your activity.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 2,
              height: '100%',
              background: theme.palette.customBackground.card,
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Contributions
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.totalContributions}
              </Typography>
              <Box 
                sx={{ 
                  mt: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  View all
                </Typography>
                <ArrowForwardIcon 
                  fontSize="small" 
                  sx={{ 
                    color: theme.palette.primary.main,
                    cursor: 'pointer',
                  }} 
                  onClick={() => navigate('/contributions')}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 2,
              height: '100%',
              background: theme.palette.customBackground.card,
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Verified Contributions
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                {stats.verifiedContributions}
              </Typography>
              <Box 
                sx={{ 
                  mt: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {((stats.verifiedContributions / stats.totalContributions) * 100 || 0).toFixed(0)}% of total
                </Typography>
                <VerifiedIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 2,
              height: '100%',
              background: theme.palette.customBackground.card,
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Impact
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                {stats.totalImpact.toFixed(2)}
              </Typography>
              <Box 
                sx={{ 
                  mt: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  View details
                </Typography>
                <ArrowForwardIcon 
                  fontSize="small" 
                  sx={{ 
                    color: theme.palette.primary.main,
                    cursor: 'pointer',
                  }} 
                  onClick={() => navigate('/impact')}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 2,
              height: '100%',
              background: theme.palette.customBackground.card,
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Token Balance
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                {stats.tokenBalance}
              </Typography>
              <Box 
                sx={{ 
                  mt: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Visit marketplace
                </Typography>
                <ArrowForwardIcon 
                  fontSize="small" 
                  sx={{ 
                    color: theme.palette.primary.main,
                    cursor: 'pointer',
                  }} 
                  onClick={() => navigate('/marketplace')}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={4}>
        {/* Recent Contributions */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%',
              boxShadow: theme.shadows[1],
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Contributions
              </Typography>
              <Button 
                endIcon={<ArrowForwardIcon />} 
                onClick={() => navigate('/contributions')}
                sx={{ textTransform: 'none' }}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {contributions.length > 0 ? (
              <List sx={{ p: 0 }}>
                {contributions.map((contribution) => (
                  <ListItem 
                    key={contribution.id} 
                    sx={{ 
                      px: 2, 
                      py: 1.5, 
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { bgcolor: 'action.hover' },
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/contributions/${contribution.id}`)}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getStatusIcon(contribution.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {contribution.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {new Date(contribution.createdAt).toLocaleDateString()}
                        </Typography>
                      }
                    />
                    {getStatusChip(contribution.status)}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 4,
                }}
              >
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  No contributions yet
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/contributions/new')}
                  sx={{ textTransform: 'none' }}
                >
                  Add Contribution
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Impact */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%',
              boxShadow: theme.shadows[1],
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Impact
              </Typography>
              <Button 
                endIcon={<ArrowForwardIcon />} 
                onClick={() => navigate('/impact')}
                sx={{ textTransform: 'none' }}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {impacts.length > 0 ? (
              <List sx={{ p: 0 }}>
                {impacts.map((impact) => (
                  <ListItem 
                    key={impact.id} 
                    sx={{ 
                      px: 2, 
                      py: 1.5, 
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { bgcolor: 'action.hover' },
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/impact/${impact.id}`)}
                  >
                    <Avatar 
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        mr: 2,
                        bgcolor: theme.palette.info.light,
                      }}
                    >
                      {impact.value.toFixed(1)}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {impact.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {new Date(impact.createdAt).toLocaleDateString()}
                        </Typography>
                      }
                    />
                    <Chip 
                      label={impact.sector.name} 
                      size="small" 
                      sx={{ 
                        bgcolor: `${theme.palette.primary.main}20`,
                        color: theme.palette.primary.main,
                        fontWeight: 500,
                      }} 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 4,
                }}
              >
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  No impact records yet
                </Typography>
                <Button
                  variant="contained"
                  color="info"
                  onClick={() => navigate('/contributions/new')}
                  sx={{ textTransform: 'none' }}
                >
                  Add Contribution to Generate Impact
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<AddIcon />}
              onClick={() => navigate('/contributions/new')}
              sx={{ 
                py: 1.5, 
                borderRadius: 2,
                textTransform: 'none',
                justifyContent: 'flex-start',
                pl: 3,
              }}
            >
              Add New Contribution
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<VerifiedIcon />}
              onClick={() => navigate('/impact')}
              sx={{ 
                py: 1.5, 
                borderRadius: 2,
                textTransform: 'none',
                justifyContent: 'flex-start',
                pl: 3,
              }}
            >
              View Impact Records
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ShoppingCartIcon />}
              onClick={() => navigate('/marketplace')}
              sx={{ 
                py: 1.5, 
                borderRadius: 2,
                textTransform: 'none',
                justifyContent: 'flex-start',
                pl: 3,
              }}
            >
              Browse Marketplace
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default DashboardPage;