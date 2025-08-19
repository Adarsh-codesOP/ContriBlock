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
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  ArrowBack as ArrowBackIcon,
  Insights as InsightsIcon,
  EmojiEvents as EmojiEventsIcon,
  Token as TokenIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Impact } from '../types';

const ImpactDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [impact, setImpact] = useState<Impact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        setLoading(true);
        // Replace with your actual API call
        // const response = await api.impact.getImpact(Number(id));
        // setImpact(response.data);
        
        // For now, using mock data
        setTimeout(() => {
          setImpact({
            id: Number(id),
            title: 'Sample Impact',
            description: 'This is a sample impact description',
            metrics: 'Carbon reduction: 10 tons',
            isVerified: true,
            contributionId: 1,
            contribution: {
              id: 1,
              title: 'Sample Contribution',
              description: 'Sample contribution description',
              status: 'APPROVED',
              userId: 1,
              user: {
                id: 1,
                wallet: '0x123...',
                role: 'USER',
                kycStatus: 'APPROVED',
                name: 'John Doe',
                email: 'john@example.com',
                reputation: 100,
                createdAt: '2023-01-01T00:00:00Z'
              },
              sectorId: 1,
              sector: {
                id: 1,
                name: 'Environmental',
                description: 'Environmental projects',
                created_at: '2023-01-01T00:00:00Z'
              },
              evidenceUrl: 'https://example.com/evidence',
              feedback: null,
              blockchainTx: '0xabc...',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z'
            },
            evidenceUrl: 'https://example.com/impact-evidence',
            feedback: 'Great impact!',
            blockchainTx: '0xdef...',
            createdAt: '2023-01-02T00:00:00Z',
            updatedAt: '2023-01-02T00:00:00Z',
            value: 85,
            tokensAwarded: 100
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load impact details');
        setLoading(false);
      }
    };

    if (id) {
      fetchImpact();
    }
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!impact) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Impact not found
      </Alert>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/impact')}
        sx={{ mb: 3 }}
      >
        Back to Impacts
      </Button>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {impact.title}
          </Typography>
          <Chip 
            icon={<CheckCircleIcon />} 
            label={impact.isVerified ? 'Verified' : 'Pending'} 
            color={impact.isVerified ? 'success' : 'warning'}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography paragraph>
              {impact.description}
            </Typography>

            <Typography variant="h6" gutterBottom>
              Metrics
            </Typography>
            <Typography paragraph>
              {impact.metrics}
            </Typography>

            {impact.feedback && (
              <>
                <Typography variant="h6" gutterBottom>
                  Feedback
                </Typography>
                <Typography paragraph>
                  {impact.feedback}
                </Typography>
              </>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Impact Details
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <InsightsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Impact Value" 
                      secondary={impact.value.toFixed(2)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TokenIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Tokens Awarded" 
                      secondary={impact.tokensAwarded.toFixed(2)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Created" 
                      secondary={new Date(impact.createdAt).toLocaleDateString()} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CategoryIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Sector" 
                      secondary={impact.contribution.sector.name} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {impact.evidenceUrl && (
              <Button 
                variant="outlined" 
                fullWidth 
                href={impact.evidenceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ mb: 2 }}
              >
                View Evidence
              </Button>
            )}

            {impact.blockchainTx && (
              <Button 
                variant="outlined" 
                fullWidth 
                href={`https://etherscan.io/tx/${impact.blockchainTx}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View on Blockchain
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Related Contribution
      </Typography>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6">{impact.contribution.title}</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {impact.contribution.description.substring(0, 200)}...
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate(`/contributions/${impact.contribution.id}`)}
        >
          View Contribution
        </Button>
      </Paper>
    </Box>
  );
};

export default ImpactDetailPage;