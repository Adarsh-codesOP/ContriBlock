import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { CircularProgress, Box } from '@mui/material';

interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectPath?: string;
}

const RoleRoute = ({ 
  children, 
  allowedRoles, 
  redirectPath = '/dashboard' 
}: RoleRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If user is not authenticated, they should be redirected by the ProtectedRoute component
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has one of the allowed roles
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;