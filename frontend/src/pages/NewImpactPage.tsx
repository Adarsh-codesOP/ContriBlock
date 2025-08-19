import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Link as LinkIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Contribution } from '../types';

interface ImpactFormData {
  title: string;
  description: string;
  metrics: string;
  contributionId: number;
  evidenceUrl: string;
  value: number;
}

const NewImpactPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<ImpactFormData>({
    title: '',
    description: '',
    metrics: '',
    contributionId: 0,
    evidenceUrl: '',
    value: 0,
  });

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setLoading(true);
        // Replace with your actual API call
        // const response = await api.contributions.getUserContributions();
        // setContributions(response.data);
        
        // For now, using mock data
        setTimeout(() => {
          setContributions([
            {
              id: 1,
              title: 'Sample Contribution 1',
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
            {
              id: 2,
              title: 'Sample Contribution 2',
              description: 'Another sample contribution',
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
              sectorId: 2,
              sector: {
                id: 2,
                name: 'Social',
                description: 'Social impact projects',
                created_at: '2023-01-01T00:00:00Z'
              },
              evidenceUrl: 'https://example.com/evidence2',
              feedback: null,
              blockchainTx: '0xdef...',
              createdAt: '2023-01-02T00:00:00Z',
              updatedAt: '2023-01-02T00:00:00Z'
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load contributions');
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContributionChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData(prev => ({ ...prev, contributionId: e.target.value as number }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const validateForm = () => {
    if (!formData.title) {
      setError('Title is required');
      return false;
    }
    if (!formData.description) {
      setError('Description is required');
      return false;
    }
    if (!formData.metrics) {
      setError('Metrics are required');
      return false;
    }
    if (!formData.contributionId) {
      setError('Please select a contribution');
      return false;
    }
    if (formData.value <= 0) {
      setError('Impact value must be greater than 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);
      
      // Replace with your actual API call
      // const response = await api.impact.createImpact(formData);
      
      // For now, simulating API call
      setTimeout(() => {
        setSuccess(true);
        setSubmitting(false);
        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate('/impact');
        }, 1500);
      }, 1500);
    } catch (err) {
      setError('Failed to create impact. Please try again.');
      setSubmitting(false);
    }
  };

  const steps = ['Select Contribution', 'Impact Details', 'Review & Submit'];

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="contribution-select-label">Contribution</InputLabel>
              <Select
                labelId="contribution-select-label"
                id="contribution-select"
                value={formData.contributionId}
                label="Contribution"
                onChange={handleContributionChange}
              >
                <MenuItem value={0}>Select a contribution</MenuItem>
                {contributions.map(contribution => (
                  <MenuItem key={contribution.id} value={contribution.id}>
                    {contribution.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {formData.contributionId > 0 && (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6">
                    {contributions.find(c => c.id === formData.contributionId)?.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {contributions.find(c => c.id === formData.contributionId)?.description}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Impact Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              label="Metrics (e.g., Carbon reduction: 10 tons)"
              name="metrics"
              value={formData.metrics}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Impact Value"
              name="value"
              type="number"
              value={formData.value}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{ inputProps: { min: 0 } }}
            />
            <TextField
              fullWidth
              label="Evidence URL"
              name="evidenceUrl"
              value={formData.evidenceUrl}
              onChange={handleChange}
              margin="normal"
              placeholder="https://example.com/evidence"
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Your Impact
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Title</Typography>
                <Typography variant="body1" gutterBottom>{formData.title}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Contribution</Typography>
                <Typography variant="body1" gutterBottom>
                  {contributions.find(c => c.id === formData.contributionId)?.title || 'Not selected'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Description</Typography>
                <Typography variant="body1" gutterBottom>{formData.description}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Metrics</Typography>
                <Typography variant="body1" gutterBottom>{formData.metrics}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Impact Value</Typography>
                <Typography variant="body1" gutterBottom>{formData.value}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Evidence URL</Typography>
                {formData.evidenceUrl ? (
                  <Typography variant="body1" gutterBottom>
                    <a href={formData.evidenceUrl} target="_blank" rel="noopener noreferrer">
                      {formData.evidenceUrl}
                    </a>
                  </Typography>
                ) : (
                  <Typography variant="body1" gutterBottom>None provided</Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Impact
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Impact created successfully!
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default NewImpactPage;