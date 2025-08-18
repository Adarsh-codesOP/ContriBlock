import { useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  useTheme,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AddCircleOutline as AddIcon,
  VerifiedUser as VerifiedUserIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  Notifications as NotificationsIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

const drawerWidth = 240;

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const drawer = (
    <div>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: [1],
        background: theme.palette.customBackground.gradient,
        color: 'white',
      }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          ContriBlock
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List component="nav" sx={{ px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => handleNavigation('/dashboard')} 
            selected={isActive('/dashboard')}
            sx={{ borderRadius: 1 }}
          >
            <ListItemIcon>
              <DashboardIcon color={isActive('/dashboard') ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => handleNavigation('/contributions')} 
            selected={isActive('/contributions')}
            sx={{ borderRadius: 1 }}
          >
            <ListItemIcon>
              <AddIcon color={isActive('/contributions') ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary="Contributions" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => handleNavigation('/impact')} 
            selected={isActive('/impact')}
            sx={{ borderRadius: 1 }}
          >
            <ListItemIcon>
              <VerifiedUserIcon color={isActive('/impact') ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary="Impact" />
          </ListItemButton>
        </ListItem>
        
        {user && (user.role === UserRole.VERIFIER || user.role === UserRole.ADMIN) && (
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => handleNavigation('/verification')} 
              selected={isActive('/verification')}
              sx={{ borderRadius: 1 }}
            >
              <ListItemIcon>
                <VerifiedUserIcon color={isActive('/verification') ? 'primary' : undefined} />
              </ListItemIcon>
              <ListItemText primary="Verification" />
            </ListItemButton>
          </ListItem>
        )}
        
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => handleNavigation('/marketplace')} 
            selected={isActive('/marketplace')}
            sx={{ borderRadius: 1 }}
          >
            <ListItemIcon>
              <ShoppingCartIcon color={isActive('/marketplace') ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary="Marketplace" />
          </ListItemButton>
        </ListItem>
        
        <Divider sx={{ my: 1 }} />
        
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => handleNavigation('/profile')} 
            selected={isActive('/profile')}
            sx={{ borderRadius: 1 }}
          >
            <ListItemIcon>
              <PersonIcon color={isActive('/profile') ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>
        
        {user && user.role === UserRole.ADMIN && (
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => handleNavigation('/admin')} 
              selected={isActive('/admin')}
              sx={{ borderRadius: 1 }}
            >
              <ListItemIcon>
                <AdminIcon color={isActive('/admin') ? 'primary' : undefined} />
              </ListItemIcon>
              <ListItemText primary="Admin" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Wallet">
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mr: 2, 
                  py: 0.5, 
                  px: 1.5, 
                  borderRadius: 2,
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                }}>
                  <WalletIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {user.wallet.substring(0, 6)}...{user.wallet.substring(user.wallet.length - 4)}
                  </Typography>
                </Box>
              </Tooltip>
              
              <Tooltip title="Notifications">
                <IconButton
                  size="large"
                  color="inherit"
                  onClick={handleNotificationMenuOpen}
                >
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Account">
                <IconButton
                  size="large"
                  edge="end"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                  sx={{ ml: 1 }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: 'primary.main',
                      fontSize: '0.875rem',
                    }}
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : user.wallet.charAt(2).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          handleProfileMenuClose();
          navigate('/profile');
        }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>
        </Box>
        <MenuItem onClick={handleNotificationMenuClose}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight={500}>Your contribution was approved</Typography>
            <Typography variant="caption" color="text.secondary">2 minutes ago</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationMenuClose}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight={500}>New marketplace item available</Typography>
            <Typography variant="caption" color="text.secondary">1 hour ago</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationMenuClose}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight={500}>Your impact record was verified</Typography>
            <Typography variant="caption" color="text.secondary">1 day ago</Typography>
          </Box>
        </MenuItem>
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
            View all notifications
          </Typography>
        </Box>
      </Menu>
    </Box>
  );
};

export default Layout;