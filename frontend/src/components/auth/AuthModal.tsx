import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, demoLogin } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'signin') {
        await login(email, password);
      } else {
        await register({
          username: username.toLowerCase().trim(),
          email: email.trim(),
          password,
          full_name: fullName.trim(),
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async (role: 'traveler' | 'admin') => {
    setError(null);
    setSubmitting(true);
    try {
      await demoLogin(role);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              {mode === 'signin' ? 'Welcome Back' : 'Join VoyageFlow'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'signin'
                ? 'Sign in to access your bookings and trips'
                : 'Create an account to start your journey'}
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Login Quick Bar */}
        <div className="p-6 pb-2 bg-gradient-to-r from-blue-50/70 via-indigo-50/70 to-purple-50/70 border-b border-blue-100/60">
          <p className="text-[10px] font-black uppercase tracking-wider text-blue-900/70 mb-2.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-600" />
            Instant 1-Click Evaluation Access:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('traveler')}
              disabled={submitting}
              className="py-2.5 px-3 bg-white hover:bg-blue-600 hover:text-white text-slate-800 rounded-2xl text-xs font-extrabold border border-blue-200/80 shadow-sm transition-all flex items-center justify-center gap-1.5 group"
            >
              <User className="w-3.5 h-3.5 text-blue-600 group-hover:text-white" />
              <span>Demo Traveler</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              disabled={submitting}
              className="py-2.5 px-3 bg-white hover:bg-purple-600 hover:text-white text-slate-800 rounded-2xl text-xs font-extrabold border border-purple-200/80 shadow-sm transition-all flex items-center justify-center gap-1.5 group"
            >
              <Shield className="w-3.5 h-3.5 text-purple-600 group-hover:text-white" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Elena Rostova"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="elenarostova"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              {mode === 'signin' ? 'Email or Username' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={mode === 'signin' ? 'text' : 'email'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'signin' ? 'traveler@voyageflow.io or elenarostova' : 'traveler@voyageflow.io'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Authenticating...</span>
            ) : mode === 'signin' ? (
              <>
                <span>Sign In to VoyageFlow</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Create My Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Toggle between modes */}
          <div className="text-center pt-2">
            {mode === 'signin' ? (
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </form>

      </div>
    </div>
  );
};
