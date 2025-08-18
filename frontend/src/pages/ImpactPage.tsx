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
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  ArrowBack as ArrowBackIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Insights as InsightsIcon,
  EmojiEvents as EmojiEventsIcon,
  Token as TokenIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Impact, Contribution, Sector } from '../types';
import Layout from '../components/layout/Layout';

// Mock data for charts - in a real app, this would come from the API
const mockSectorData = [
  { name: 'Environmental', value: 35 },
  { name: 'Social', value: 25 },
  { name: 'Educational', value: 20 },
  { name: 'Healthcare', value: 15 },
  { name: 'Other', value: 5 },
];

const mockTimeData = [
  { month: 'Jan', value: 10 },
  { month: 'Feb', value: 15 },
  { month: 'Mar', value: 12 },
  { month: 'Apr', value: 18 },
  { month: 'May', value: 22 },
  { month: 'Jun', value: 28 },
];

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
      id={`impact-tabpanel-${index}`}
      aria-labelledby={`impact-tab-${index}`}
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
    id: `impact-tab-${index}`,
    'aria-controls': `impact-tabpanel-${index}`,
  };
}

const ImpactPage = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [impact, setImpact] = useState<Impact | null>(null);
  const [userImpacts, setUserImpacts] = useState<Impact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalImpacts, setTotalImpacts] = useState(0);
  const [sectors, setSectors] = useState<Sector[]>([]);

  useEffect(() => {
    fetchSectors();
    
    if (id) {
      fetchImpact(id);
    } else {
      fetchUserImpacts();
    }
  }, [id, page, rowsPerPage]);

  const fetchSectors = async () => {
    try {
      const response = await api.sectors.getAllSectors();
      setSectors(response.data);
    } catch (err) {
      console.error('Error fetching sectors:', err);
    }
  };

  const fetchImpact = async (impactId: string) => {
    setIsLoading(true);
    try {
      const response = await api.impact.getImpact(impactId);
      setImpact(response.data);
    } catch (err) {
      console.error('Error fetching impact:', err);
      setError('Failed to load impact details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserImpacts = async () => {
    setIsLoading(true);
    try {
      const response = await api.impact.getUserImpacts(page + 1, rowsPerPage);
      setUserImpacts(response.data.impacts);
      setTotalImpacts(response.data.total);
    } catch (err) {
      console.error('Error fetching user impacts:', err);
      setError('Failed to load impact records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getSectorName = (sectorId: string) => {
    const sector = sectors.find(s => s.id === sectorId);
    return sector ? sector.name : 'Unknown';
  };

  if (isLoading && !impact && userImpacts.length === 0) {
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
            onClick={() => navigate('/dashboard')}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            Back to Dashboard
          </Button>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Layout>
    );
  }

  // Single Impact Detail View
  if (id && impact) {
    return (
      <Layout>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/impact')}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            Back to All Impacts
          </Button>
          
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Impact Details
          </Typography>
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
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 0 }}>
                  Impact Information
                </Typography>
                <Chip 
                  icon={<CheckCircleIcon />} 
                  label="Verified" 
                  color="success" 
                  variant="outlined" 
                />
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Impact ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {impact.id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date Generated
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {new Date(impact.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Impact Value
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                    {impact.value.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tokens Awarded
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                    {impact.tokensAwarded.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {impact.description || 'Impact generated from verified contribution.'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                boxShadow: theme.shadows[1],
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Related Contribution
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {impact.contribution ? (
                <Box>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {impact.contribution.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip 
                          icon={<CategoryIcon />} 
                          label={getSectorName(impact.contribution.sectorId)} 
                          variant="outlined" 
                          size="small"
                          sx={{ 
                            mr: 1,
                            bgcolor: `${theme.palette.primary.main}10`,
                            color: theme.palette.primary.main,
                            borderColor: theme.palette.primary.main,
                          }} 
                        />
                        <Chip 
                          icon={<CalendarIcon />} 
                          label={new Date(impact.contribution.createdAt).toLocaleDateString()} 
                          variant="outlined" 
                          size="small"
                          sx={{ color: 'text.secondary' }} 
                        />
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/contributions/${impact.contribution.id}`)}
                      sx={{ textTransform: 'none' }}
                    >
                      View Contribution
                    </Button>
                  </Box>
                  
                  <Typography variant="body1" paragraph>
                    {impact.contribution.description}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No related contribution found.
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                borderRadius: 2,
                mb: 3,
                background: theme.palette.customBackground.card,
              }}
            >
              <CardContent>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <InsightsIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Impact Summary
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: `${theme.palette.info.main}15`,
                      mb: 2,
                    }}
                  >
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 700, 
                        color: theme.palette.info.main,
                      }}
                    >
                      {impact.value.toFixed(1)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Total Impact Value
                  </Typography>
                </Box>
                
                <List sx={{ p: 0 }}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <TokenIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Tokens Awarded" 
                      secondary={impact.tokensAwarded.toFixed(2)} 
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <EmojiEventsIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Achievement" 
                      secondary={impact.value > 50 ? 'Gold Impact' : impact.value > 25 ? 'Silver Impact' : 'Bronze Impact'} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                boxShadow: theme.shadows[1],
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                What's Next?
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                Congratulations on generating impact! You can use your earned tokens in the marketplace or continue contributing to earn more impact points.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/marketplace')}
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  Explore Marketplace
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/contributions/new')}
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  Add New Contribution
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Layout>
    );
  }

  // All Impacts View
  return (
    <Layout>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        Impact Tracking
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Track and visualize the impact you've generated through your verified contributions.
      </Typography>

      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="impact tabs"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                minWidth: 100,
              },
            }}
          >
            <Tab 
              icon={<TimelineIcon />} 
              iconPosition="start" 
              label="Impact Records" 
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<BarChartIcon />} 
              iconPosition="start" 
              label="Analytics" 
              {...a11yProps(1)} 
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Paper 
            sx={{ 
              width: '100%', 
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: theme.shadows[1],
            }}
          >
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="impact records table">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Sector</TableCell>
                    <TableCell align="right">Impact Value</TableCell>
                    <TableCell align="right">Tokens Awarded</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userImpacts.length > 0 ? (
                    userImpacts.map((impact) => (
                      <TableRow
                        key={impact.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {new Date(impact.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {impact.description || 'Impact from verified contribution'}
                        </TableCell>
                        <TableCell>
                          {impact.contribution ? getSectorName(impact.contribution.sectorId) : 'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            sx={{ 
                              fontWeight: 600, 
                              color: theme.palette.info.main 
                            }}
                          >
                            {impact.value.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            sx={{ 
                              fontWeight: 600, 
                              color: theme.palette.success.main 
                            }}
                          >
                            {impact.tokensAwarded.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/impact/${impact.id}`)}
                            sx={{ textTransform: 'none' }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Box sx={{ py: 3 }}>
                          <Typography variant="body1" color="text.secondary">
                            No impact records found. Start contributing to generate impact!
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={() => navigate('/contributions/new')}
                            sx={{ mt: 2, textTransform: 'none' }}
                          >
                            Add New Contribution
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {userImpacts.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalImpacts}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </Paper>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={4}>
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
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <PieChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Impact by Sector
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Box 
                  sx={{ 
                    height: 300, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Chart visualization would be implemented here with a charting library like Recharts or Chart.js
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  {mockSectorData.map((item) => (
                    <Box 
                      key={item.name}
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">{item.name}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.value}%</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
            
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
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <BarChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Impact Over Time
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Box 
                  sx={{ 
                    height: 300, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Chart visualization would be implemented here with a charting library like Recharts or Chart.js
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Your impact has been growing steadily over the past 6 months, with the highest impact generated in June.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/contributions/new')}
                    sx={{ textTransform: 'none' }}
                  >
                    Add More Contributions
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
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
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <InsightsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Impact Summary
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        background: theme.palette.customBackground.card,
                      }}
                    >
                      <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                        {userImpacts.reduce((sum, impact) => sum + impact.value, 0).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Impact
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        background: theme.palette.customBackground.card,
                      }}
                    >
                      <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                        {userImpacts.reduce((sum, impact) => sum + impact.tokensAwarded, 0).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Tokens
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        background: theme.palette.customBackground.card,
                      }}
                    >
                      <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                        {userImpacts.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Impact Records
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        background: theme.palette.customBackground.card,
                      }}
                    >
                      <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                        {userImpacts.length > 0 ? Math.max(...userImpacts.map(i => i.value)).toFixed(2) : '0.00'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Highest Impact
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Layout>
  );
};

export default ImpactPage;