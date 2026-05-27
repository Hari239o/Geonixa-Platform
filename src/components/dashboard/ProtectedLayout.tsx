"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Shield, Menu, X } from 'lucide-react';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'admin' | 'any';
  title?: string;
}

export default function ProtectedLayout({
  children,
  requiredRole = 'any',
  title = 'Dashboard',
}: ProtectedLayoutProps) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          const userRole = data.user.role || 'student';

          // Check role authorization
          if (requiredRole !== 'any' && userRole !== requiredRole) {
            router.push('/auth/login');
            return;
          }

          setUser(data.user);
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router, requiredRole]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050810] text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-slate-900 border-t-[#FF5A1F] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050810] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 md:px-8 py-6 border-b border-slate-900 bg-[#080B14]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FF5A1F] rounded flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter hidden sm:inline">GEONIXA</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-xs font-black text-white">{user?.name || 'User'}</span>
              <span className="text-[10px] font-bold text-[#FF5A1F] uppercase tracking-widest">
                {user?.role || 'Student'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-3 bg-slate-900 hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-all border border-slate-800"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-3 bg-slate-900 hover:bg-slate-800 rounded-xl transition-all border border-slate-800"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-20 right-4 bg-[#0D121F] border border-slate-900 rounded-xl p-4 space-y-3 w-48"
          >
            <div className="flex flex-col gap-2 pb-3 border-b border-slate-800">
              <span className="text-xs font-black text-white">{user?.name || 'User'}</span>
              <span className="text-[10px] font-bold text-[#FF5A1F] uppercase tracking-widest">
                {user?.role || 'Student'}
              </span>
            </div>
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition-all text-sm font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#080B14]/50 px-8 py-6 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-xs text-slate-500">
            <p>&copy; 2024 GEONIXA Enterprise Assessment Terminal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
