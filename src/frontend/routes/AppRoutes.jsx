import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute.jsx';

// Direct load for initial landing and auth
import { LandingPage } from '../pages/LandingPage.jsx';
import { Login } from '../pages/auth/Login.jsx';
import { Register } from '../pages/auth/Register.jsx';

// Lazy-loaded dashboard routes for code splitting
const CustomerDashboard = lazy(() =>
  import('../pages/customer/CustomerDashboard.jsx').then((m) => ({ default: m.CustomerDashboard }))
);
const BookingsList = lazy(() =>
  import('../pages/customer/BookingsList.jsx').then((m) => ({ default: m.BookingsList }))
);
const NeighbourhoodPools = lazy(() =>
  import('../pages/customer/NeighbourhoodPools.jsx').then((m) => ({ default: m.NeighbourhoodPools }))
);
const CookDashboard = lazy(() =>
  import('../pages/cook/CookDashboard.jsx').then((m) => ({ default: m.CookDashboard }))
);
const AvailabilityManager = lazy(() =>
  import('../pages/cook/AvailabilityManager.jsx').then((m) => ({ default: m.AvailabilityManager }))
);
const ProfileEdit = lazy(() =>
  import('../pages/cook/ProfileEdit.jsx').then((m) => ({ default: m.ProfileEdit }))
);
const AdminDashboard = lazy(() =>
  import('../pages/admin/AdminDashboard.jsx').then((m) => ({ default: m.AdminDashboard }))
);

const RouteLoadingFallback = () => (
  <div className="min-h-screen bg-[#F8F5EC] flex flex-col items-center justify-center space-y-4 font-sans">
    <div className="w-12 h-12 rounded-2xl bg-[#173D2E]/10 text-[#173D2E] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#173D2E] border-t-transparent rounded-full animate-spin" />
    </div>
    <p className="text-xs font-semibold text-[#77796F] uppercase tracking-widest">
      Loading VaniCook...
    </p>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Routes */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/bookings"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <BookingsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/pools"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <NeighbourhoodPools />
            </ProtectedRoute>
          }
        />

        {/* Cook Routes */}
        <Route
          path="/cook/dashboard"
          element={
            <ProtectedRoute allowedRoles={['COOK']}>
              <CookDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cook/availability"
          element={
            <ProtectedRoute allowedRoles={['COOK']}>
              <AvailabilityManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cook/profile"
          element={
            <ProtectedRoute allowedRoles={['COOK']}>
              <ProfileEdit />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
