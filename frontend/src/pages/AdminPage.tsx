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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedUserIcon,
  Block as BlockIcon,
  SupervisorAccount as AdminIcon,
  AccountCircle as UserIcon,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { User, UserRole, KycStatus } from '../types';

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openKycDialog, setOpenKycDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USER);
  const [selectedKycStatus, setSelectedKycStatus] = useState<KycStatus>(KycStatus.PENDING);

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== UserRole.ADMIN) {
      navigate('/dashboard');
      return;
    }
    
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenRoleDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setOpenRoleDialog(true);
  };

  const handleOpenKycDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedKycStatus(user.kycStatus);
    setOpenKycDialog(true);
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      await fetch(`/api/v1/users/${selectedUser.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
      });
      
      // Update local state
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, role: selectedRole } : u
      ));
      
      setOpenRoleDialog(false);
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKycStatusChange = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      await fetch(`/api/v1/users/${selectedUser.id}/kyc`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kyc_status: selectedKycStatus }),
      });
      
      // Update local state
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, kycStatus: selectedKycStatus } : u
      ));
      
      setOpenKycDialog(false);
    } catch (err) {
      console.error('Error updating KYC status:', err);
      setError('Failed to update KYC status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleChip = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return (
          <Chip 
            icon={<AdminIcon />}
            label="Admin" 
            color="error" 
            size="small" 
            variant="outlined" 
          />
        );
      case UserRole.VERIFIER:
        return (
          <Chip 
            icon={<VerifiedUserIcon />}
            label="Verifier" 
            color="info" 
            size="small" 
            variant="outlined" 
          />
        );
      case UserRole.USER:
        return (
          <Chip 
            icon={<UserIcon />}
            label="User" 
            color="primary" 
            size="small" 
            variant="outlined" 
          />
        );
      default:
        return null;
    }
  };

  const getKycStatusChip = (status: KycStatus) => {
    switch (status) {
      case KycStatus.APPROVED:
        return (
          <Chip 
            icon={<VerifiedUserIcon />}
            label="Approved" 
            color="success" 
            size="small" 
            variant="outlined" 
          />
        );
      case KycStatus.PENDING:
        return (
          <Chip 
            icon={<SecurityIcon />}
            label="Pending" 
            color="warning" 
            size="small" 
            variant="outlined" 
          />
        );
      case KycStatus.REJECTED:
        return (
          <Chip 
            icon={<BlockIcon />}
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

  if (isLoading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="User Management" />
          <Tab label="System Stats" />
          <Tab label="Settings" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            User Management
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Wallet</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>KYC Status</TableCell>
                  <TableCell>Reputation</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {user.wallet.substring(0, 6)}...{user.wallet.substring(user.wallet.length - 4)}
                      </Typography>
                    </TableCell>
                    <TableCell>{getRoleChip(user.role)}</TableCell>
                    <TableCell>{getKycStatusChip(user.kycStatus)}</TableCell>
                    <TableCell>{user.reputation}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => handleOpenRoleDialog(user)}
                        sx={{ mr: 1, mb: { xs: 1, md: 0 } }}
                      >
                        Change Role
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => handleOpenKycDialog(user)}
                      >
                        Update KYC
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            System Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4">{users.length}</Typography>
                <Typography variant="body1">Total Users</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4">
                  {users.filter(u => u.role === UserRole.VERIFIER).length}
                </Typography>
                <Typography variant="body1">Verifiers</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4">
                  {users.filter(u => u.kycStatus === KycStatus.APPROVED).length}
                </Typography>
                <Typography variant="body1">KYC Approved</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            System Settings
          </Typography>
          <Typography variant="body1">
            System settings will be implemented in a future update.
          </Typography>
        </Paper>
      </TabPanel>
      
      {/* Role Change Dialog */}
      <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)}>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Update the role for user {selectedUser?.wallet.substring(0, 6)}...{selectedUser?.wallet.substring(selectedUser?.wallet.length - 4)}
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={selectedRole}
              label="Role"
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            >
              <MenuItem value={UserRole.USER}>User</MenuItem>
              <MenuItem value={UserRole.VERIFIER}>Verifier</MenuItem>
              <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRoleDialog(false)}>Cancel</Button>
          <Button onClick={handleRoleChange} variant="contained">
            Update Role
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* KYC Status Dialog */}
      <Dialog open={openKycDialog} onClose={() => setOpenKycDialog(false)}>
        <DialogTitle>Update KYC Status</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Update the KYC status for user {selectedUser?.wallet.substring(0, 6)}...{selectedUser?.wallet.substring(selectedUser?.wallet.length - 4)}
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="kyc-select-label">KYC Status</InputLabel>
            <Select
              labelId="kyc-select-label"
              value={selectedKycStatus}
              label="KYC Status"
              onChange={(e) => setSelectedKycStatus(e.target.value as KycStatus)}
            >
              <MenuItem value={KycStatus.PENDING}>Pending</MenuItem>
              <MenuItem value={KycStatus.APPROVED}>Approved</MenuItem>
              <MenuItem value={KycStatus.REJECTED}>Rejected</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenKycDialog(false)}>Cancel</Button>
          <Button onClick={handleKycStatusChange} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage;