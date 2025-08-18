import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  MenuItem,
  Pagination,
  Divider,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Contribution, ContributionStatus } from '../types';
import Layout from '../components/layout/Layout';

const ContributionsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(9);

  useEffect(() => {
    fetchContributions();
  }, [page, statusFilter]);

  const fetchContributions = async () => {
    setIsLoading(true);
    try {
      const response = await api.contributions.getUserContributions();
      let filteredContributions = response.data;
      
      // Apply status filter if not 'all'
      if (statusFilter !== 'all') {
        filteredContributions = filteredContributions.filter(
          (contribution: Contribution) => contribution.status === statusFilter
        );
      }
      
      // Apply search term filter if present
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredContributions = filteredContributions.filter(
          (contribution: Contribution) => 
            contribution.title.toLowerCase().includes(term) ||
            contribution.description.toLowerCase().includes(term)
        );
      }
      
      // Calculate pagination
      setTotalPages(Math.ceil(filteredContributions.length / itemsPerPage));
      
      // Get current page items
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedContributions = filteredContributions.slice(startIndex, startIndex + itemsPerPage);
      
      setContributions(paginatedContributions);
    } catch (error) {
      console.error('Error fetching contributions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(event.target.value);
    setPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSearch = () => {
    fetchContributions();
  };

  const getStatusChip = (status: ContributionStatus) => {
    switch (status) {
      case ContributionStatus.VERIFIED:
        return (
          <Chip 
            icon={<CheckCircleIcon />} 
            label="Verified" 
            color="success" 
            size="small" 
            variant="outlined" 
          />
        );
      case ContributionStatus.PENDING:
        return (
          <Chip 
            icon={<PendingIcon />} 
            label="Pending" 
            color="warning" 
            size="small" 
            variant="outlined" 
          />
        );
      case ContributionStatus.REJECTED:
        return (
          <Chip 
            icon={<CancelIcon />} 
            label="Rejected" 
            color="error" 
            size="small" 
            variant="outlined" 
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Contributions
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/contributions/new')}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
            }}
          >
            Add Contribution
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Manage and track your contributions
        </Typography>
      </Box>

      {/* Filters */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 2, 
          mb: 4,
          alignItems: 'center',
        }}
      >
        <TextField
          placeholder="Search contributions"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { borderRadius: 2 },
          }}
          sx={{ flexGrow: 1, maxWidth: { xs: '100%', sm: 300 } }}
          size="small"
        />
        
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={handleStatusFilterChange}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FilterIcon />
              </InputAdornment>
            ),
            sx: { borderRadius: 2 },
          }}
          sx={{ width: { xs: '100%', sm: 200 } }}
        >
          <MenuItem value="all">All Statuses</MenuItem>
          <MenuItem value={ContributionStatus.PENDING}>Pending</MenuItem>
          <MenuItem value={ContributionStatus.VERIFIED}>Verified</MenuItem>
          <MenuItem value={ContributionStatus.REJECTED}>Rejected</MenuItem>
        </TextField>
      </Box>

      {isLoading ? (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 400 
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {contributions.length > 0 ? (
            <Grid container spacing={3}>
              {contributions.map((contribution) => (
                <Grid item xs={12} sm={6} md={4} key={contribution.id}>
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
                    <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          mb: 2,
                        }}
                      >
                        {getStatusChip(contribution.status)}
                        <Tooltip title="More options">
                          <IconButton size="small">
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                        {contribution.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {contribution.description.length > 120
                          ? `${contribution.description.substring(0, 120)}...`
                          : contribution.description}
                      </Typography>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          mt: 'auto',
                        }}
                      >
                        <Chip 
                          label={contribution.sector.name} 
                          size="small" 
                          sx={{ 
                            bgcolor: `${theme.palette.primary.main}20`,
                            color: theme.palette.primary.main,
                          }} 
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(contribution.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => navigate(`/contributions/${contribution.id}`)}
                        sx={{ textTransform: 'none' }}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" gutterBottom>
                No contributions found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first contribution'}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 4 
              }}
            >
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}
    </Layout>
  );
};

export default ContributionsPage;