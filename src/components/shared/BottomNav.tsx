'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
}

const CampaignIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={props.strokeWidth || 2}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={props.size || 24}
    height={props.size || 24}
    className={props.className}
    {...props}
  >
    <circle cx="7.5" cy="7.5" r="3.5" />
    <path d="M16.5 3.5 L20.5 10.5 H12.5 Z" />
    <path d="M7.5 12.5 Q7.5 16.5 11.5 16.5 Q7.5 16.5 7.5 20.5 Q7.5 16.5 3.5 16.5 Q7.5 16.5 7.5 12.5 Z" />
    <rect x="13.5" y="13.5" width="6" height="6" rx="1" />
  </svg>
);

const HomeIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={props.strokeWidth || 2}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={props.size || 24}
    height={props.size || 24}
    className={props.className}
    {...props}
  >
    <path d="M5.5 11.5L10.5858 6.41421C11.3668 5.63316 12.6332 5.63316 13.4142 6.41421L18.5 11.5V16.5C18.5 17.8807 17.3807 19 16 19H8C6.61929 19 5.5 17.8807 5.5 16.5V11.5Z" />
    <line x1="12" y1="13" x2="12" y2="16" />
  </svg>
);

const WalletIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={props.strokeWidth || 2}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={props.size || 24}
    height={props.size || 24}
    className={props.className}
    {...props}
  >
    <path d="M5 8.5C5 7.11929 6.11929 6 7.5 6H13C13.5523 6 14 6.44772 14 7V8.5" />
    <path d="M14 8.5H5V17.5C5 18.8807 6.11929 20 7.5 20H16.5C17.8807 20 19 18.8807 19 17.5V11C19 9.61929 17.8807 8.5 16.5 8.5H14" />
    <line x1="9" y1="13" x2="13" y2="13" />
    <path d="M19 12.5H17C16.4477 12.5 16 12.9477 16 13.5C16 14.0523 16.4477 14.5 17 14.5H19" />
  </svg>
);

const AIIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    width={props.size || 24}
    height={props.size || 24}
    className={props.className}
    {...props}
  >
    <g transform="rotate(45 12 12)">
      <path fillRule="evenodd" clipRule="evenodd" d="M8.5 5C8.5 4.44772 8.94772 4 9.5 4H14.5C15.0523 4 15.5 4.44772 15.5 5V19C15.5 19.5523 15.0523 20 14.5 20H9.5C8.94772 20 8.5 19.5523 8.5 19V5ZM10 5.5H14V9.5H10V5.5Z" fill="currentColor" />
    </g>
    <path d="M10 2.5 Q10 5 12.5 5 Q10 5 10 7.5 Q10 5 7.5 5 Q10 5 10 2.5 Z" fill="currentColor" />
    <path d="M19 4 Q19 6 21 6 Q19 6 19 8 Q19 6 17 6 Q19 6 19 4 Z" fill="currentColor" />
    <path d="M16.5 13 Q16.5 15 18.5 15 Q16.5 15 16.5 17 Q16.5 15 14.5 15 Q16.5 15 16.5 13 Z" fill="currentColor" />
  </svg>
);

interface BottomNavProps {
 profilePic?: string;
}

export default function BottomNav({ profilePic = '/profile_pic.png' }: BottomNavProps) {
 const router = useRouter();
 const pathname = usePathname();

  const navItems = [
    { name: 'Home', path: '/home', icon: HomeIcon },
    { name: 'Wallet', path: '/wallet', icon: WalletIcon },
    { name: 'Campaign', path: '/campaigns', icon: CampaignIcon },
    { name: 'AI', path: '/ai', icon: AIIcon },
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
        className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${pathname.startsWith('/profile') ? 'ring-2 ring-offset-2 ring-[#EF4823] rounded-full' : ''}`}
        onClick={() => router.push('/profile')}
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
