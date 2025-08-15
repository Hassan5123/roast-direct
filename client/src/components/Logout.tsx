"use client";

import { useAuth } from '../utils/authContext';

export default function Logout() {
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
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