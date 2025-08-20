import { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, CssBaseline } from "@mui/material";

import { useAuth } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
// Import HomePage normally as it's the landing page
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
// Lazy load all other pages
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ContributionsPage = lazy(() => import("./pages/ContributionsPage"));
const ContributionDetailPage = lazy(() => import("./pages/ContributionDetailPage"));
const NewContributionPage = lazy(() => import("./pages/NewContributionPage"));
const ImpactPage = lazy(() => import("./pages/ImpactPage"));
const ImpactDetailPage = lazy(() => import("./pages/ImpactDetailPage"));
const NewImpactPage = lazy(() => import("./pages/NewImpactPage"));
const VerificationPage = lazy(() => import("./pages/VerificationPage"));
const MarketplacePage = lazy(() => import("./pages/MarketplacePage"));
const MarketplaceItemPage = lazy(() => import("./pages/MarketplaceItemPage"));
const NewMarketplaceItemPage = lazy(() => import("./pages/NewMarketplaceItemPage"));
const PurchaseHistoryPage = lazy(() => import("./pages/PurchaseHistoryPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Loading component for Suspense fallback
const LoadingComponent = () => (
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

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingComponent />;
  }

  // Check both isAuthenticated flag and user existence
  if (!isAuthenticated || !user) {
    // Save the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
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
    return <LoadingComponent />;
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
    return <LoadingComponent />;
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
                <Suspense fallback={<LoadingComponent />}>
                  <DashboardPage />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/contributions"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<LoadingComponent />}>
                  <ContributionsPage />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/contributions/new"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<LoadingComponent />}>
                  <NewContributionPage />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/contributions/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<LoadingComponent />}>
                  <ContributionDetailPage />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/impact"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<LoadingComponent />}>
                  <ImpactPage />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/impact/new"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<LoadingComponent />}>
                  <NewImpactPage />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/impact/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<LoadingComponent />}>
                  <ImpactDetailPage />
                </Suspense>
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
                  <Suspense fallback={<LoadingComponent />}>
                    <VerificationPage />
                  </Suspense>
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
                <Suspense fallback={<LoadingComponent />}>
                  <MarketplacePage />
                </Suspense>
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
                  <Suspense fallback={<LoadingComponent />}>
                    <NewMarketplaceItemPage />
                  </Suspense>
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
                <Suspense fallback={<LoadingComponent />}>
                  <PurchaseHistoryPage />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<LoadingComponent />}>
                  <MarketplaceItemPage />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<LoadingComponent />}>
                  <ProfilePage />
                </Suspense>
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
                  <Suspense fallback={<LoadingComponent />}>
                    <AdminPage />
                  </Suspense>
                </Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingComponent />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
}

export default App;
