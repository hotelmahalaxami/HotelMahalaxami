import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import PublicLayout from '../layouts/PublicLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Core entry pages loaded eagerly for immediate rendering
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import HomePage from '../pages/public/HomePage';

// Lazy-loaded public pages
const MenuPage = lazy(() => import('../pages/public/MenuPage'));
const AboutPage = lazy(() => import('../pages/public/AboutPage'));
const ContactPage = lazy(() => import('../pages/public/ContactPage'));

// Lazy-loaded internal POS pages
const PosOrderPage = lazy(() => import('../pages/PosOrderPage'));
const LiveOrdersPage = lazy(() => import('../pages/LiveOrdersPage'));
const BillingHistoryPage = lazy(() => import('../pages/BillingHistoryPage'));
const AdminMenuPage = lazy(() => import('../pages/AdminMenuPage'));
const TableManagementPage = lazy(() => import('../pages/TableManagementPage'));
const StaffManagementPage = lazy(() => import('../pages/StaffManagementPage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));

const PageFallback = () => (
  <div className="flex h-64 items-center justify-center">
    <LoadingSpinner size="md" />
  </div>
);

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Public Restaurant Website Experience (No Login Required) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/menu"
            element={
              <Suspense fallback={<PageFallback />}>
                <MenuPage />
              </Suspense>
            }
          />
          <Route
            path="/about"
            element={
              <Suspense fallback={<PageFallback />}>
                <AboutPage />
              </Suspense>
            }
          />
          <Route
            path="/contact"
            element={
              <Suspense fallback={<PageFallback />}>
                <ContactPage />
              </Suspense>
            }
          />
        </Route>

        {/* 2. Staff Authentication Entry Point */}
        <Route path="/login" element={<LoginPage />} />

        {/* 3. Internal Protected POS System */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/orders/create"
              element={
                <Suspense fallback={<PageFallback />}>
                  <PosOrderPage />
                </Suspense>
              }
            />
            <Route path="/orders" element={<Navigate to="/orders/create" replace />} />
            <Route
              path="/live-orders"
              element={
                <Suspense fallback={<PageFallback />}>
                  <LiveOrdersPage />
                </Suspense>
              }
            />

            <Route
              path="/billing"
              element={
                <Suspense fallback={<PageFallback />}>
                  <BillingHistoryPage />
                </Suspense>
              }
            />
            <Route
              path="/admin/menu"
              element={
                <Suspense fallback={<PageFallback />}>
                  <AdminMenuPage />
                </Suspense>
              }
            />
            <Route
              path="/admin/tables"
              element={
                <Suspense fallback={<PageFallback />}>
                  <TableManagementPage />
                </Suspense>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <Suspense fallback={<PageFallback />}>
                  <StaffManagementPage />
                </Suspense>
              }
            />
            <Route
              path="/reports"
              element={
                <Suspense fallback={<PageFallback />}>
                  <ReportsPage />
                </Suspense>
              }
            />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
