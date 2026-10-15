import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Core entry pages loaded eagerly for immediate rendering
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';

// Lazy-loaded pages for smaller initial bundle and faster load
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
        <Route path="/login" element={<LoginPage />} />
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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
