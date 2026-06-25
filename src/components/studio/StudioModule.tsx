'use client';
import React from 'react';
import BottomNav from '../shared/BottomNav';
import { LayoutGrid } from 'lucide-react';

export default function StudioModule() {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#f9fafb] pb-24">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Studio</h1>
        <p className="text-gray-500 mb-8">Manage your creative assets and content.</p>
        
        <div className="bg-white rounded-[32px] p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
          <LayoutGrid size={48} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Studio Module</h2>
          <p className="text-gray-500 text-sm">This module is currently under development.</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
