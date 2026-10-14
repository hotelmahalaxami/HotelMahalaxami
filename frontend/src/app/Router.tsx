import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import PosOrderPage from '../pages/PosOrderPage';
import BillingHistoryPage from '../pages/BillingHistoryPage';
import AdminMenuPage from '../pages/AdminMenuPage';
import StaffManagementPage from '../pages/StaffManagementPage';
import ReportsPage from '../pages/ReportsPage';
import LiveOrdersPage from '../pages/LiveOrdersPage';
import TableManagementPage from '../pages/TableManagementPage';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/orders/create" element={<PosOrderPage />} />
            <Route path="/orders" element={<Navigate to="/orders/create" replace />} />
            <Route path="/live-orders" element={<LiveOrdersPage />} />
            <Route path="/billing" element={<BillingHistoryPage />} />
            <Route path="/admin/menu" element={<AdminMenuPage />} />
            <Route path="/admin/tables" element={<TableManagementPage />} />
            <Route path="/admin/staff" element={<StaffManagementPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
