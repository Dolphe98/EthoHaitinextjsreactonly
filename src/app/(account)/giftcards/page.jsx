"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GiftCardsPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.push('/account');
    }
  }, [token, router]);

  if (!mounted || !token) return <div className="pt-32 min-h-screen bg-ethoBg"></div>;

  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="text-sm text-gray-500 mb-8 font-medium">
          <Link href="/account" className="hover:text-haitiBlue transition-colors">Your Account</Link>
          <span className="mx-2">›</span>
          <span className="text-ethoDark">Gift Cards</span>
        </nav>

        <h1 className="text-4xl font-extrabold text-ethoDark mb-4">EthoHaiti Gift Cards</h1>
        <p className="text-xl text-gray-600 mb-10">Give the gift of culture. Perfect for any occasion.</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-ethoDark p-8 text-center border-b-4 border-haitiRed">
             <svg className="w-16 h-16 text-white mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
             <h2 className="text-2xl font-bold text-white">Digital Gift Cards</h2>
             <p className="text-gray-300 mt-2">Delivered instantly via email.</p>
          </div>

          <div className="p-8 sm:p-10 prose prose-lg text-gray-600 max-w-none">
            <h3 className="text-2xl font-bold text-ethoDark border-b-2 border-gray-100 pb-4 mb-6 mt-4">How it Works</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
               <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <h4 className="font-bold text-ethoDark text-lg mb-2">Sending a Gift</h4>
                  <p className="text-sm">
                    Select your desired amount, enter the recipient's email address, and add a custom message. They will receive an email with a unique code that never expires.
                  </p>
               </div>
               <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <h4 className="font-bold text-ethoDark text-lg mb-2">Redeeming a Gift</h4>
                  <p className="text-sm">
                    If you received a gift card, simply shop the store normally. During checkout, enter your unique gift card code in the "Discount / Gift Card" box to instantly apply your balance.
                  </p>
               </div>
            </div>

            <h3 className="text-xl font-bold text-ethoDark mb-4 mt-8">Check Your Balance</h3>
            <p className="text-sm mb-6">
              Need to know how much is left on your card? Enter your code below.
            </p>
            
            {/* Fake Balance Checker for UI */}
            <div className="flex gap-2 max-w-md">
              <input type="text" placeholder="Enter Gift Card Code" className="flex-grow border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-haitiBlue" />
              <button onClick={() => alert("Gift Card integration coming soon!")} className="bg-haitiBlue hover:bg-blue-800 text-white font-bold py-3 px-6 rounded transition-colors">
                Check
              </button>
            </div>

            <div className="mt-12 text-center">
              <button onClick={() => alert("Gift Card purchasing coming soon!")} className="inline-block bg-haitiRed hover:bg-red-700 text-white font-extrabold py-4 px-10 rounded shadow-md transition-colors text-lg">
                Buy a Gift Card Now
              </button>
            </div>
            
          </div>
        </div>

      </div>
    </main>
  );
}