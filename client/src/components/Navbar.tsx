import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-6 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Brand Name */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="RoastDirect Logo" 
              width={50} 
              height={50} 
              className="mr-2"
            />
            <span className="text-amber-800 font-bold text-xl">RoastDirect</span>
          </div>
        </Link>
        
        {/* Navigation Links */}
        <div className="flex items-center space-x-4">
          <Link href="/products" className="px-4 py-2 text-gray-700 hover:text-amber-700 transition-colors duration-200">
            Shop Products
          </Link>
          <Link href="/signup" className="px-4 py-2 rounded-md bg-amber-700 text-white hover:bg-amber-800 transition-colors duration-200 w-[100px] text-center">
            Sign Up
          </Link>
          <Link href="/login" className="px-4 py-2 rounded-md bg-amber-700 text-white hover:bg-amber-800 transition-colors duration-200 w-[100px] text-center">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;