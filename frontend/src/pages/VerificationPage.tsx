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
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  VerifiedUser as VerifiedUserIcon,
  AccessTime as AccessTimeIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Contribution, ContributionStatus, UserRole } from '../types';
import Layout from '../components/layout/Layout';

const VerificationPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [pendingContributions, setPendingContributions] = useState<Contribution[]>([]);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationDecision, setVerificationDecision] = useState<'approve' | 'reject' | ''>('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    // Check if user is a verifier
    if (user && user.role !== UserRole.VERIFIER && user.role !== UserRole.ADMIN) {
      navigate('/dashboard');
      return;
    }
    
    fetchPendingContributions();
  }, [user, navigate]);

  const fetchPendingContributions = async () => {
    setIsLoading(true);
    try {
      const response = await api.verification.getPendingContributions();
      if (response && response.data) {
        setPendingContributions(response.data);
      } else {
        setPendingContributions([]);
      }
    } catch (err) {
      console.error('Error fetching pending contributions:', err);
      setError('Failed to load pending contributions. Please try again.');
      setPendingContributions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContributionSelect = (contribution: Contribution) => {
    setSelectedContribution(contribution);
    // Reset form fields
    setVerificationNotes('');
    setVerificationDecision('');
    setRejectionReason('');
    setSuccessMessage(null);
  };

  const handleSubmitVerification = async () => {
    if (!selectedContribution || !verificationDecision) {
      return;
    }

    if (verificationDecision === 'reject' && !rejectionReason) {
      setError('Please provide a reason for rejection.');
      return;
    }

    setConfirmDialogOpen(true);
  };

  const confirmVerification = async () => {
    if (!selectedContribution || !verificationDecision) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (verificationDecision === 'approve') {
        await api.verification.approveContribution(selectedContribution.id, {
          notes: verificationNotes,
        });
        setSuccessMessage('Contribution has been approved successfully!');
      } else {
        await api.verification.rejectContribution(selectedContribution.id, {
          reason: rejectionReason,
        });
        setSuccessMessage('Contribution has been rejected.');
      }

      // Refresh the list of pending contributions
      fetchPendingContributions();
      
      // Reset form
      setVerificationDecision('');
      setVerificationNotes('');
      setRejectionReason('');
    } catch (err) {
      console.error('Error submitting verification:', err);
      setError('Failed to submit verification. Please try again.');
    } finally {
      setIsSubmitting(false);
      setConfirmDialogOpen(false);
    }
  };

  if (isLoading && pendingContributions.length === 0) {
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
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        Contribution Verification
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Review and verify pending contributions submitted by users.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}

      <Grid container spacing={4}>
        {/* Pending Contributions List */}
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%',
              boxShadow: theme.shadows[1],
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Pending Contributions
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {pendingContributions.length === 0 ? (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 4,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 48, color: theme.palette.success.main, mb: 2 }} />
                <Typography variant="body1" align="center">
                  No pending contributions to verify at this time.
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {pendingContributions.map((contribution) => (
                  <ListItem 
                    key={contribution.id} 
                    button 
                    onClick={() => handleContributionSelect(contribution)}
                    selected={selectedContribution?.id === contribution.id}
                    sx={{ 
                      mb: 1, 
                      borderRadius: 1,
                      '&.Mui-selected': {
                        bgcolor: `${theme.palette.primary.main}15`,
                      },
                      '&.Mui-selected:hover': {
                        bgcolor: `${theme.palette.primary.main}20`,
                      },
                    }}
                  >
                    <ListItemIcon>
                      <PendingIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={contribution.title} 
                      secondary={
                        <>
                          <Typography variant="body2" component="span" color="text.secondary">
                            {new Date(contribution.createdAt).toLocaleDateString()}
                          </Typography>
                          <Chip 
                            size="small" 
                            label={contribution.sector.name} 
                            sx={{ 
                              ml: 1, 
                              height: 20, 
                              fontSize: '0.7rem',
                              bgcolor: `${theme.palette.primary.main}15`,
                            }} 
                          />
                        </>
                      } 
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Contribution Details and Verification Form */}
        <Grid item xs={12} md={8}>
          {selectedContribution ? (
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                boxShadow: theme.shadows[1],
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {selectedContribution.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Chip 
                  icon={<PendingIcon />} 
                  label="Pending Verification" 
                  color="warning" 
                  variant="outlined" 
                  sx={{ mr: 1 }}
                />
                <Chip 
                  icon={<CategoryIcon />} 
                  label={selectedContribution.sector.name} 
                  variant="outlined" 
                  sx={{ 
                    bgcolor: `${theme.palette.primary.main}10`,
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                  }} 
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                  Submitted on {new Date(selectedContribution.createdAt).toLocaleDateString()}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedContribution.description}
                  </Typography>
                </Grid>

                {selectedContribution.evidenceUrl && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Evidence
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<LinkIcon />}
                      href={selectedContribution.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textTransform: 'none' }}
                    >
                      View Evidence
                    </Button>
                  </Grid>
                )}

                {selectedContribution.imageUrl && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Images
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<ImageIcon />}
                      href={selectedContribution.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textTransform: 'none' }}
                    >
                      View Image
                    </Button>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Box 
                    sx={{ 
                      mt: 2, 
                      p: 3, 
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Verification Decision
                    </Typography>

                    <FormControl component="fieldset" sx={{ mb: 3 }}>
                      <FormLabel component="legend">Select your decision:</FormLabel>
                      <RadioGroup
                        row
                        value={verificationDecision}
                        onChange={(e) => setVerificationDecision(e.target.value as 'approve' | 'reject' | '')}
                      >
                        <FormControlLabel 
                          value="approve" 
                          control={<Radio />} 
                          label="Approve" 
                        />
                        <FormControlLabel 
                          value="reject" 
                          control={<Radio />} 
                          label="Reject" 
                        />
                      </RadioGroup>
                    </FormControl>

                    {verificationDecision === 'approve' && (
                      <TextField
                        label="Verification Notes (Optional)"
                        multiline
                        rows={4}
                        fullWidth
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        placeholder="Add any notes about this verification..."
                        sx={{ mb: 3 }}
                      />
                    )}

                    {verificationDecision === 'reject' && (
                      <TextField
                        label="Rejection Reason"
                        multiline
                        rows={4}
                        fullWidth
                        required
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Please provide a detailed reason for rejection..."
                        error={!rejectionReason && error !== null}
                        helperText={!rejectionReason && error !== null ? 'Rejection reason is required' : ''}
                        sx={{ mb: 3 }}
                      />
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color={verificationDecision === 'approve' ? 'success' : 'error'}
                        disabled={!verificationDecision || (verificationDecision === 'reject' && !rejectionReason) || isSubmitting}
                        onClick={handleSubmitVerification}
                        sx={{ 
                          textTransform: 'none',
                          minWidth: 120,
                        }}
                      >
                        {isSubmitting ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : verificationDecision === 'approve' ? (
                          'Approve'
                        ) : (
                          'Reject'
                        )}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ) : (
            <Paper 
              sx={{ 
                p: 4, 
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: theme.shadows[1],
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  maxWidth: 500,
                  textAlign: 'center',
                }}
              >
                <VerifiedUserIcon sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2, opacity: 0.7 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Select a Contribution to Verify
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Choose a pending contribution from the list to review its details and make a verification decision.
                </Typography>
                {pendingContributions.length === 0 && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate('/dashboard')}
                    sx={{ mt: 2, textTransform: 'none' }}
                  >
                    Return to Dashboard
                  </Button>
                )}
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>
          {verificationDecision === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {verificationDecision === 'approve'
              ? 'Are you sure you want to approve this contribution? This will generate impact and tokens for the contributor.'
              : 'Are you sure you want to reject this contribution? The contributor will be notified with your provided reason.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={confirmVerification} 
            color={verificationDecision === 'approve' ? 'success' : 'error'}
            variant="contained"
            autoFocus
          >
            {verificationDecision === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default VerificationPage;