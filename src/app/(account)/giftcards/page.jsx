"use client";

import Link from 'next/link';

export default function GiftCardsComingSoon() {
  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        
        {/* Animated Gift Icon */}
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-haitiBlue rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-white p-6 rounded-full shadow-xl border border-gray-100">
            <svg 
              className="w-16 h-16 text-haitiBlue" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              strokeWidth="1.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl font-extrabold text-ethoDark mb-4 tracking-tight">
          EthoHaiti Gift Cards
        </h1>
        <p className="text-xl text-haitiRed font-bold mb-6">
          Coming Soon to Phase 3
        </p>
        <p className="text-gray-500 mb-10 leading-relaxed">
          The perfect way to share Haitian culture. We’re working on a digital gift card system that will allow you to send instant, personalized gear to your friends and family.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <Link 
            href="/" 
            className="w-full bg-haitiBlue text-white py-4 rounded-xl font-extrabold text-lg shadow-lg hover:bg-blue-800 transition-all active:scale-95"
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