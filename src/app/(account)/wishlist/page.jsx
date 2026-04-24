"use client";

import Link from 'next/link';

export default function WishlistComingSoon() {
  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        
        {/* Animated Icon */}
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-haitiRed rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-white p-6 rounded-full shadow-xl border border-gray-100">
            <svg 
              className="w-16 h-16 text-haitiRed" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl font-extrabold text-ethoDark mb-4 tracking-tight">
          Favorites & Wishlists
        </h1>
        <p className="text-xl text-haitiBlue font-bold mb-6">
          Coming Soon to Phase 3
        </p>
        <p className="text-gray-500 mb-10 leading-relaxed">
          We're building a way for you to save your favorite EthoHaiti designs and share them with the world. Stay tuned!
        </p>

        {/* Action Button */}
        <div className="flex flex-col gap-4">
          <Link 
            href="/" 
            className="w-full bg-haitiRed text-white py-4 rounded-xl font-extrabold text-lg shadow-lg hover:bg-red-700 transition-all active:scale-95"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/account" 
            className="text-gray-500 font-bold hover:text-ethoDark transition-colors"
          >
            Back to My Account
          </Link>
        </div>

      </div>
    </main>
  );
}