'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Home, LayoutGrid, Wand2, Wallet } from 'lucide-react';

interface BottomNavProps {
  profilePic?: string;
}

export default function BottomNav({ profilePic = '/profile_pic.png' }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: 'Creator', path: '/creator', icon: Home },
    { name: 'Studio', path: '/studio', icon: LayoutGrid },
    { name: 'Portfolio', path: '/portfolio', icon: Wand2 },
    { name: 'Booking', path: '/booking', icon: Wallet },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-between items-center px-6 py-4 z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;
        return (
          <div 
            key={item.name}
            className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isActive ? 'text-[#EF4823]' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => router.push(item.path)}
          >
            {isActive ? (
              <div className="bg-[#EF4823]/10 p-3 rounded-2xl">
                <Icon size={24} strokeWidth={2.5} className="text-[#EF4823]" />
              </div>
            ) : (
              <Icon size={24} strokeWidth={2} />
            )}
          </div>
        );
      })}
      
      <div 
        className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${pathname === '/setup-profile' ? 'ring-2 ring-offset-2 ring-[#EF4823] rounded-full' : ''}`}
        onClick={() => router.push('/setup-profile')}
      >
        <Image 
          src={profilePic || '/profile_pic.png'} 
          alt="Profile" 
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover border border-gray-200" 
        />
      </div>
    </nav>
  );
}
