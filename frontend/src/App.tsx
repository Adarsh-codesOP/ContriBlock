import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress, CssBaseline } from "@mui/material";

import { useAuth } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ContributionsPage from "./pages/ContributionsPage";
import ContributionDetailPage from "./pages/ContributionDetailPage";
import NewContributionPage from "./pages/NewContributionPage";
import ImpactPage from "./pages/ImpactPage";
import ImpactDetailPage from "./pages/ImpactDetailPage"; // ✅ now valid
import NewImpactPage from "./pages/NewImpactPage";
import VerificationPage from "./pages/VerificationPage";
import MarketplacePage from "./pages/MarketplacePage";
import MarketplaceItemPage from "./pages/MarketplaceItemPage";
import NewMarketplaceItemPage from "./pages/NewMarketplaceItemPage";
import PurchaseHistoryPage from "./pages/PurchaseHistoryPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import NotFoundPage from "./pages/NotFoundPage";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Role-based route component
const RoleRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!appReady || isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/contributions"
          element={
            <ProtectedRoute>
              <Layout>
                <ContributionsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/contributions/new"
          element={
            <ProtectedRoute>
              <Layout>
                <NewContributionPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/contributions/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ContributionDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/impact"
          element={
            <ProtectedRoute>
              <Layout>
                <ImpactPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/impact/new"
          element={
            <ProtectedRoute>
              <Layout>
                <NewImpactPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/impact/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ImpactDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/verification"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["VERIFIER", "ADMIN"]}>
                <Layout>
                  <VerificationPage />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <Layout>
                <MarketplacePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace/new"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <Layout>
                  <NewMarketplaceItemPage />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace/purchases"
          element={
            <ProtectedRoute>
              <Layout>
                <PurchaseHistoryPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <MarketplaceItemPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <Layout>
                  <AdminPage />
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
