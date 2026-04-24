"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import AuthBridge from '@/components/auth/AuthBridge';
import Link from 'next/link'; 

export default function AccountPage() {
  const { token, user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // MANAGER FIX: Replaced the "white screen of death" with a High-Fidelity Skeleton Loader
  if (!mounted) {
    return (
      <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-gray-200 pb-6">
            <div className="w-full">
              <div className="h-10 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="mt-4 md:mt-0 h-10 bg-gray-200 rounded w-32"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[200px]">
                <div className="w-16 h-16 bg-gray-100 rounded-full mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-48"></div>
              </div>
            ))}
          </div>

        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="pt-32 pb-20 min-h-screen bg-ethoBg px-4">
        <AuthBridge />
      </main>
    );
  }

  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-ethoDark">My Account</h1>
            <p className="text-gray-500 mt-2 font-medium">Logged in as: {user?.email}</p>
          </div>
          <button 
            onClick={logout}
            className="mt-4 md:mt-0 border-2 border-haitiRed text-haitiRed font-bold px-6 py-2 rounded hover:bg-haitiRed hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <Link href="/orders" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[200px] text-center hover:shadow-lg transition-all group">
            <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
               <svg className="w-8 h-8 text-haitiBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-ethoDark mb-2">Your Orders</h2>
            <p className="text-sm text-gray-500">Track packages, return, or buy things again</p>
          </Link>

          <Link href="/addresses" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[200px] text-center hover:shadow-lg transition-all group">
            <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
               <svg className="w-8 h-8 text-haitiBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-ethoDark mb-2">Your Addresses</h2>
            <p className="text-sm text-gray-500">Edit addresses for orders</p>
          </Link>

          <Link href="/security" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[200px] text-center hover:shadow-lg transition-all group">
            <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
               <svg className="w-8 h-8 text-haitiBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-ethoDark mb-2">Login & Security</h2>
            <p className="text-sm text-gray-500">Edit your name, email, and password</p>
          </Link>

          <Link href="/wishlist" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[200px] text-center hover:shadow-lg transition-all group">
            <div className="bg-red-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
               <svg className="w-8 h-8 text-haitiRed" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-ethoDark mb-2">Your Wishlist</h2>
            <p className="text-sm text-gray-500">Save items for later or share with friends</p>
          </Link>

          <Link href="/support" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[200px] text-center hover:shadow-lg transition-all group">
            <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
               <svg className="w-8 h-8 text-haitiBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-ethoDark mb-2">Customer Service</h2>
            <p className="text-sm text-gray-500">Contact us via Email or WhatsApp</p>
          </Link>

          {/* --- MANAGER FIX: Added the Affiliate link --- */}
          <Link href="/affiliates" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[200px] text-center hover:shadow-lg transition-all group">
            <div className="bg-red-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
               <svg className="w-8 h-8 text-haitiRed" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-ethoDark mb-2">Affiliate Program</h2>
            <p className="text-sm text-gray-500">Earn money by sharing EthoHaiti</p>
          </Link>

          {/* --- MANAGER FIX: Added the Gift Card link --- */}
          <Link href="/giftcards" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[200px] text-center hover:shadow-lg transition-all group">
            <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
               <svg className="w-8 h-8 text-haitiBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-ethoDark mb-2">Gift Cards</h2>
            <p className="text-sm text-gray-500">Buy, send, or redeem EthoHaiti gift cards</p>
          </Link>
        </div>
      </div>
    </main>
  );
}