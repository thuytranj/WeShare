import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout, AppLayout } from '../layouts';
import { LoginForm, RegisterForm, ForgotPasswordForm, OAuthCallback } from '../features/auth';
import { FeedView } from '../features/feed';
import { SettingsView } from '../features/settings';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route
        path="/login"
        element={
          <AuthLayout>
            <LoginForm />
          </AuthLayout>
        }
      />
      <Route
        path="/register"
        element={
          <AuthLayout>
            <RegisterForm />
          </AuthLayout>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AuthLayout>
            <ForgotPasswordForm />
          </AuthLayout>
        }
      />

      {/* Main Feed & Social Routes */}
      <Route
        path="/"
        element={
          <AppLayout>
            <FeedView />
          </AppLayout>
        }
      />
      <Route
        path="/explore"
        element={
          <AppLayout>
            <FeedView />
          </AppLayout>
        }
      />
      <Route
        path="/notifications"
        element={
          <AppLayout>
            <FeedView />
          </AppLayout>
        }
      />
      <Route
        path="/messages"
        element={
          <AppLayout>
            <FeedView />
          </AppLayout>
        }
      />
      <Route
        path="/bookmarks"
        element={
          <AppLayout>
            <FeedView />
          </AppLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <AppLayout showRightRail={false}>
            <SettingsView />
          </AppLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <AppLayout showRightRail={false}>
            <SettingsView />
          </AppLayout>
        }
      />
      <Route
        path="/settings/profile"
        element={
          <AppLayout showRightRail={false}>
            <SettingsView />
          </AppLayout>
        }
      />

      {/* Catch-all redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
