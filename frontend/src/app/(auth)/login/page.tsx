"use client";

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { authService } from '@/services/authService';
import { Package2, ArrowRight, Loader2, ShieldCheck, Zap, BarChart3, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const features = [
  { icon: BarChart3, label: 'Live Order Analytics', desc: 'Real-time dashboards for every transaction' },
  { icon: ShieldCheck, label: 'Secure & Reliable',   desc: 'Enterprise-grade auth and data protection'  },
  { icon: Zap,        label: 'Instant Notifications', desc: 'WebSocket-powered live order alerts'        },
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      await authService.login(formData);
      login();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-950">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Mesh gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-rose-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-500/15 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-rose-800/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-600/30">
            <Package2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">OrderTask</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Manage orders<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
                at the speed of light.
              </span>
            </h2>
            <p className="mt-4 text-zinc-400 text-base leading-relaxed max-w-sm">
              A unified command center for your entire order workflow — from placement to delivery.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="mt-0.5 h-8 w-8 rounded-lg bg-rose-600/10 border border-rose-600/20 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-zinc-600 text-xs">
          © {new Date().getFullYear()} OrderTask. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Subtle glow */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-rose-600/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="h-9 w-9 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-600/30">
              <Package2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">OrderTask</span>
          </div>

          {/* Card */}
          <div className="bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800/80 rounded-3xl shadow-2xl shadow-black/60 p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
              <p className="text-zinc-400 text-sm mt-1.5">Sign in to your account to continue</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm flex items-center gap-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-300">Username</label>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500/60 transition-all duration-200 placeholder:text-zinc-600 hover:border-zinc-700"
                  placeholder="Enter your username"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-300">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 pr-11 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500/60 transition-all duration-200 placeholder:text-zinc-600 hover:border-zinc-700"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full mt-2 relative overflow-hidden bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg shadow-rose-600/20 hover:shadow-rose-500/30"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-zinc-600 text-xs">or</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            {/* Switch to signup */}
            <p className="mt-5 text-center text-sm text-zinc-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-rose-400 hover:text-rose-300 font-semibold transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
