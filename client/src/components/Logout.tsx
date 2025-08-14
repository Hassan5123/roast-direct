"use client";

import { useRouter } from 'next/navigation';

export default function Logout() {
  const router = useRouter();
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    
    // Dispatch a storage event so other components (like Navbar) can detect the change
    window.dispatchEvent(new Event('storage'));
    
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-md bg-amber-700 text-white hover:bg-amber-800 transition-colors duration-200"
    >
      Logout
    </button>
  );
}