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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  useTheme,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Sector, ContributionFormData } from '../types';
import Layout from '../components/layout/Layout';

const steps = ['Basic Information', 'Evidence & Details', 'Review & Submit'];

const NewContributionPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContributionFormData>({
    title: '',
    description: '',
    sectorId: '',
    evidenceUrl: '',
    imageUrl: '',
  });
  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    sectorId: '',
  });

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchSectors();
  }, [user, navigate]);

  const fetchSectors = async () => {
    try {
      const response = await api.sectors.getAllSectors();
      setSectors(response || []);
    } catch (err) {
      console.error('Error fetching sectors:', err);
      setError('Failed to load sectors. Please try again.');
      setSectors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSectorChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value as string;
    setFormData(prev => ({ ...prev, sectorId: value }));
    
    // Clear error when user selects
    if (formErrors.sectorId) {
      setFormErrors(prev => ({ ...prev, sectorId: '' }));
    }
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors = { ...formErrors };

    if (activeStep === 0) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
        isValid = false;
      }
      
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
        isValid = false;
      } else if (formData.description.trim().length < 20) {
        newErrors.description = 'Description must be at least 20 characters';
        isValid = false;
      }
      
      if (!formData.sectorId) {
        newErrors.sectorId = 'Please select a sector';
        isValid = false;
      }
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.contributions.createContribution(formData);
      if (response && response.data && response.data.id) {
        navigate(`/contributions/${response.data.id}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error submitting contribution:', err);
      setError('Failed to submit contribution. Please try again.');
      setIsSubmitting(false);
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
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/contributions')}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Back to Contributions
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          New Contribution
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Submit a new contribution to be verified and earn impact points.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          boxShadow: theme.shadows[1],
        }}
      >
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>
          {/* Step 1: Basic Information */}
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Contribution Title"
                  fullWidth
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                  placeholder="Enter a clear, descriptive title for your contribution"
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
                  placeholder="Describe your contribution in detail. What did you do? How does it create positive impact?"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!formErrors.sectorId}>
                  <InputLabel id="sector-select-label">Sector</InputLabel>
                  <Select
                    labelId="sector-select-label"
                    name="sectorId"
                    value={formData.sectorId}
                    onChange={handleSectorChange}
                    label="Sector"
                  >
                    {sectors.map((sector) => (
                      <MenuItem key={sector.id} value={sector.id}>
                        {sector.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.sectorId && <FormHelperText>{formErrors.sectorId}</FormHelperText>}
                </FormControl>
              </Grid>
            </Grid>
          )}

          {/* Step 2: Evidence & Details */}
          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Supporting Evidence
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Provide links or upload files that verify your contribution. This will help verifiers approve your submission faster.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="evidenceUrl"
                  label="Evidence URL"
                  fullWidth
                  value={formData.evidenceUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/evidence"
                  InputProps={{
                    startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  helperText="Link to external evidence (GitHub repository, article, document, etc.)"
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
                  InputProps={{
                    startAdornment: <ImageIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  helperText="Link to an image that showcases your contribution"
                />
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Note: In a production environment, this form would include file upload functionality for evidence and images.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          )}

          {/* Step 3: Review & Submit */}
          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Review Your Contribution
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Please review your contribution details before submitting.
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Title
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formData.title}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {formData.description}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Sector
                      </Typography>
                      <Typography variant="body1">
                        {sectors.find(s => s.id === formData.sectorId)?.name || 'Not selected'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Evidence URL
                      </Typography>
                      {formData.evidenceUrl ? (
                        <Typography 
                          variant="body1" 
                          component="a" 
                          href={formData.evidenceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          sx={{ 
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {formData.evidenceUrl}
                        </Typography>
                      ) : (
                        <Typography variant="body1" color="text.secondary">
                          Not provided
                        </Typography>
                      )}
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Image
                      </Typography>
                      {formData.imageUrl ? (
                        <Box 
                          sx={{ 
                            mt: 1, 
                            p: 1, 
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 1,
                            textAlign: 'center',
                          }}
                        >
                          <Box 
                            component="img" 
                            src={formData.imageUrl} 
                            alt="Contribution evidence" 
                            sx={{ 
                              maxWidth: '100%', 
                              maxHeight: 200, 
                              borderRadius: 1,
                            }} 
                          />
                        </Box>
                      ) : (
                        <Typography variant="body1" color="text.secondary">
                          No image provided
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    After submission, your contribution will be reviewed by our verifiers. This process typically takes 1-3 business days.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBackIcon />}
              sx={{ textTransform: 'none' }}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Contribution'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Layout>
  );
};

export default NewContributionPage;