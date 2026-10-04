import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import type { ApiException } from '../types/api';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (isAuthenticated && !authLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.usernameOrEmail.trim()) errors.usernameOrEmail = 'Username or email is required';
    if (!formData.password) errors.password = 'Password is required';
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await login(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const apiErr = err as ApiException;
      setError(apiErr.apiError?.message ?? 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-surface-light via-surface to-surface-card p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-brand-500 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-brand-600 blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          {/* Logo */}
          <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-brand-500 shadow-2xl">
            <svg className="h-14 w-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18M3 3v14a2 2 0 002 2h14a2 2 0 002-2V3M3 3l9 5 9-5" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Mahalaxmi Hotel</h1>
          <p className="text-brand-400 text-lg font-medium mb-1">Ispurli, Maharashtra</p>
          <p className="text-gray-400 text-sm mt-4 max-w-xs">Point of Sale & Restaurant Management System</p>

          {/* Feature highlights */}
          <div className="mt-12 space-y-4 text-left">
            {[
              { icon: '⚡', text: 'Fast order processing' },
              { icon: '📊', text: 'Real-time sales reports' },
              { icon: '🔒', text: 'Secure & role-based access' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-gray-300">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8">
        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center lg:hidden">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-brand-500">
            <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18M3 3v14a2 2 0 002 2h14a2 2 0 002-2V3M3 3l9 5 9-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Mahalaxmi Hotel</h1>
          <p className="text-brand-400 text-sm">Ispurli, Maharashtra</p>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="mt-1 text-gray-400 text-sm">Sign in to your POS account</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
              <svg className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Username/Email field */}
            <div>
              <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-300 mb-2">
                Username or Email
              </label>
              <input
                id="usernameOrEmail"
                name="usernameOrEmail"
                type="text"
                autoComplete="username"
                value={formData.usernameOrEmail}
                onChange={handleChange}
                placeholder="Enter your username or email"
                className={`w-full rounded-lg border px-4 py-3 text-sm text-white placeholder-gray-500 bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  fieldErrors.usernameOrEmail
                    ? 'border-red-500/50 focus:ring-red-500'
                    : 'border-white/10 focus:border-brand-500'
                }`}
              />
              {fieldErrors.usernameOrEmail && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.usernameOrEmail}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full rounded-lg border px-4 py-3 pr-12 text-sm text-white placeholder-gray-500 bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    fieldErrors.password
                      ? 'border-red-500/50 focus:ring-red-500'
                      : 'border-white/10 focus:border-brand-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-500">
            Internal POS system &mdash; Mahalaxmi Hotel &copy; 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
