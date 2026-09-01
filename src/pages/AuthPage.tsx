import React, { useState } from 'react';
import { Zap, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/auth.service';
import { UserProfile } from '../types';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onOpenOnboarding: (user: UserProfile) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLoginSuccess,
  onOpenOnboarding
}) => {
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('inderjeetcode@gmail.com');
  const [password, setPassword] = useState('123456');
  const [fullName, setFullName] = useState('Inderjeet Singh');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await authService.signInWithGoogle();
      if (!user.onboarding_completed) {
        onOpenOnboarding(user);
      } else {
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Google sign in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await authService.login(email.trim(), password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await authService.signup(email.trim(), password, fullName.trim());
      onOpenOnboarding(user);
    } catch (err: any) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(email.trim());
      setForgotSent(true);
    } catch (err: any) {
      setError(err.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col justify-center items-center p-4">
      {/* Decorative gradient glowing orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#141416] border border-[#262628] rounded-[32px] p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#CCFF00] flex items-center justify-center text-[#0A0A0B] shadow-[0_0_30px_rgba(204,255,0,0.35)] mb-3">
            <Zap className="w-8 h-8 stroke-[3]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display uppercase">
            FitSathi
          </h1>
          <p className="text-xs text-zinc-400 font-medium mt-1">
            Personal Health, Nutrition & Diet Companion
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-500/15 border border-red-500/30 rounded-2xl text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Google Sign-in Button */}
        <button
          type="button"
          id="btn-google-auth"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mb-4 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-sm disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">or with email</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* LOGIN FORM */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#161618] border border-[#262628] focus:border-[#CCFF00] text-sm text-white rounded-2xl pl-11 pr-4 py-3 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setView('forgot');
                    setError('');
                  }}
                  className="text-xs font-bold text-[#CCFF00] hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#161618] border border-[#262628] focus:border-[#CCFF00] text-sm text-white rounded-2xl pl-11 pr-4 py-3 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-login-submit"
              disabled={loading}
              className="w-full py-4 bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(204,255,0,0.3)] transition-all active:scale-95 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Logging in...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            <div className="pt-4 text-center">
              <p className="text-xs text-zinc-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  id="btn-switch-to-signup"
                  onClick={() => {
                    setView('signup');
                    setError('');
                  }}
                  className="font-bold text-[#CCFF00] hover:underline"
                >
                  Create Account
                </button>
              </p>
            </div>
          </form>
        )}

        {/* SIGNUP FORM */}
        {view === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Inderjeet Singh"
                  className="w-full bg-[#161618] border border-[#262628] focus:border-[#CCFF00] text-sm text-white rounded-2xl pl-11 pr-4 py-3 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#161618] border border-[#262628] focus:border-[#CCFF00] text-sm text-white rounded-2xl pl-11 pr-4 py-3 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#161618] border border-[#262628] focus:border-[#CCFF00] text-sm text-white rounded-2xl pl-11 pr-4 py-3 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-signup-submit"
              disabled={loading}
              className="w-full py-4 bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(204,255,0,0.3)] transition-all active:scale-95 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Creating Account...' : 'Continue to Onboarding'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            <div className="pt-4 text-center">
              <p className="text-xs text-zinc-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setError('');
                  }}
                  className="font-bold text-[#CCFF00] hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {view === 'forgot' && (
          <div className="space-y-4">
            {forgotSent ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-emerald-300">
                  Password reset link sent to {email}. Follow email instructions to reset password.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <p className="text-xs text-zinc-400">
                  Enter your email address to receive password recovery instructions.
                </p>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-[#161618] border border-[#262628] text-sm text-white rounded-2xl pl-11 pr-4 py-3 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#CCFF00] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-2xl"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setView('login');
                  setError('');
                  setForgotSent(false);
                }}
                className="text-xs font-bold text-zinc-400 hover:text-white"
              >
                ← Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
