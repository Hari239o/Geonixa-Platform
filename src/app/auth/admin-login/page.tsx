"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ADMIN_EMAIL = 'talent@geonixa.com';
const ADMIN_PASSWORD = 'talent@9908';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const router = useRouter();

  // Check if already locked due to failed attempts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lockoutExpiry = localStorage.getItem('admin_lockout_expiry');
      if (lockoutExpiry && new Date().getTime() < parseInt(lockoutExpiry)) {
        setIsLocked(true);
        const remainingTime = Math.ceil((parseInt(lockoutExpiry) - new Date().getTime()) / 1000);
        setError(`Account locked for security. Try again in ${remainingTime} seconds.`);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Security: Rate limiting
    if (isLocked) {
      setError('Account temporarily locked for security. Please try again later.');
      return;
    }

    if (attemptCount >= 5) {
      setIsLocked(true);
      const lockoutTime = 15 * 60 * 1000; // 15 minutes
      const expiryTime = new Date().getTime() + lockoutTime;
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_lockout_expiry', expiryTime.toString());
      }
      setError('Too many failed attempts. Account locked for 15 minutes.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Strict credential validation - EXACT match only
    if (email.trim() !== ADMIN_EMAIL) {
      setAttemptCount(prev => prev + 1);
      setError(`⚠ ACCESS DENIED: Email credentials invalid. Attempt ${attemptCount + 1}/5`);
      setIsLoading(false);
      return;
    }

    if (password !== ADMIN_PASSWORD) {
      setAttemptCount(prev => prev + 1);
      setError(`⚠ ACCESS DENIED: Password incorrect. Attempt ${attemptCount + 1}/5`);
      setIsLoading(false);
      return;
    }

    // Valid credentials - create secure session
    try {
      if (typeof window !== 'undefined') {
        // Create admin session token (expires in 8 hours)
        const expiresAt = new Date().getTime() + 8 * 60 * 60 * 1000;
        // Use browser-safe base64 encoding
        const payload = JSON.stringify({
          email: ADMIN_EMAIL,
          isAdmin: true,
          createdAt: new Date().getTime(),
          expiresAt: expiresAt
        });
        const sessionToken = typeof window !== 'undefined' && typeof btoa === 'function'
          ? btoa(payload)
          : Buffer.from(payload).toString('base64');

        // Determine API origin: handle file:// served pages during dev
        const origin = (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:')
          ? 'http://localhost:3000'
          : (typeof window !== 'undefined' ? window.location.origin : '');

        // Set session cookie (include credentials so browser accepts Set-Cookie)
        const response = await fetch(`${origin}/api/auth/admin-session`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken })
        });

        if (response.ok) {
          // Store in localStorage as backup
          localStorage.setItem('admin_session', sessionToken);
          localStorage.setItem('admin_email', ADMIN_EMAIL);
          localStorage.removeItem('admin_lockout_expiry');
          
          setIsSuccess(true);
          
          // Redirect immediately once session is created
          window.location.href = '/admin/dashboard';
        } else {
          // Try to extract error details from server and include response URL
          let serverMsg = `Session creation failed (status ${response.status})`;
          let detailedError = '';
          try {
            const body = await response.json();
            if (body && (body.error || body.message)) {
              serverMsg = String(body.error || body.message);
              if (body.details) {
                detailedError = String(body.details);
              }
            } else {
              serverMsg = JSON.stringify(body || {});
            }
          } catch (err) {
            const text = await response.text().catch(() => null);
            if (text) {
              serverMsg = text;
            } else {
              serverMsg = `Unable to parse server response (HTTP ${response.status})`;
            }
          }

          const errorDetails = {
            message: serverMsg,
            details: detailedError,
            status: response.status,
            url: response.url,
            timestamp: new Date().toISOString()
          };
          
          console.error('Admin session creation failed:', errorDetails);
          setError(`Session error: ${serverMsg}${detailedError ? ` - ${detailedError}` : ''}`);
          setIsLoading(false);
        }
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error('Authentication error during session creation:', {
        error: errorMsg,
        stack: e instanceof Error ? e.stack : 'N/A',
        timestamp: new Date().toISOString()
      });
      setError(`Authentication error: ${errorMsg}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col selection:bg-blue-500/30">
      <div className="mesh-bg" />
      <div className="grid-overlay" />

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="admin-login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col p-6"
          >
            {/* Header */}
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between mb-12">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 glass-panel flex items-center justify-center rounded-lg group-hover:border-blue-500/50 transition-all">
                  <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </div>
                <span className="text-xs font-black text-slate-500 tracking-widest uppercase">Back to Home</span>
              </Link>
              <div className="flex items-center gap-3">
                <img src="/images/geonixa-logo.png" alt="Geonixa Logo" className="h-10 w-auto" />
              </div>
            </div>

            {/* Login Card */}
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="w-full max-w-lg">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel p-8 md:p-12 rounded-[40px] relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-50" />

                  <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black tracking-widest mb-6">
                      <Shield className="w-3 h-3" /> ADMIN PORTAL
                    </div>
                    <h2 className="text-3xl font-black text-white italic tracking-tight">EXECUTIVE ACCESS</h2>
                    <p className="text-slate-500 text-sm font-medium mt-2">Authorized administrators only. Invalid attempts will be logged.</p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-[11px] text-red-400 font-bold"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p>{error}</p>
                        {attemptCount >= 3 && (
                          <p className="mt-1 text-red-300">Remaining attempts: {5 - attemptCount}</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">ADMIN EMAIL</label>
                      <input
                        type="email"
                        placeholder="talent@geonixa.com"
                        required
                        disabled={isLocked}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        value={email}
                        onChange={e => setEmail(e.target.value.trim())}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">ADMIN PASSWORD</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          required
                          disabled={isLocked}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 pr-16 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLocked}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors disabled:opacity-50"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      disabled={isLoading || isLocked}
                      type="submit"
                      className="btn-premium w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black tracking-widest transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-blue-900/20"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          AUTHENTICATING...
                        </>
                      ) : isLocked ? (
                        <>
                          <Lock className="w-5 h-5" />
                          ACCOUNT LOCKED
                        </>
                      ) : (
                        <>
                          VERIFY CREDENTIALS
                          <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-10 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                      <Lock className="w-3 h-3 text-blue-500" /> SECURE AUTHENTICATION REQUIRED
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Footer */}
            <div className="max-w-7xl mx-auto w-full py-8 text-center">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">
                ENCRYPTED SESSION • GEONIXA ADMIN v1.0
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-6"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30"
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-black text-white mb-2">CREDENTIALS VERIFIED</h1>
              <p className="text-slate-400 text-lg">Granting administrative access...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
