"use client";

import Link from 'next/link';

export default function AccountPage() {
  // TODO: Replace mockUser with real auth session
  const mockUser = { lastName: "Baptiste", city: "Miami", zip: "33101" };

  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ethoDark mb-8 text-center sm:text-left">
          Welcome back, {mockUser.lastName} 👋
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* My Orders */}
          <Link href="/orders/1" className="bg-white rounded-xl p-6 shadow hover:shadow-lg border border-gray-100 flex flex-col items-center justify-center gap-3 text-center font-bold text-ethoDark transition-shadow">
            <svg className="w-10 h-10 text-haitiBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            My Orders
          </Link>

          {/* My Addresses */}
          <Link href="#" className="bg-white rounded-xl p-6 shadow hover:shadow-lg border border-gray-100 flex flex-col items-center justify-center gap-3 text-center font-bold text-ethoDark transition-shadow">
            <svg className="w-10 h-10 text-haitiBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            My Addresses
          </Link>

          {/* Wishlist */}
          <Link href="#" className="bg-white rounded-xl p-6 shadow hover:shadow-lg border border-gray-100 flex flex-col items-center justify-center gap-3 text-center font-bold text-ethoDark transition-shadow">
            <svg className="w-10 h-10 text-haitiRed" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            Wishlist
          </Link>

          {/* Account Settings */}
          <Link href="#" className="bg-white rounded-xl p-6 shadow hover:shadow-lg border border-gray-100 flex flex-col items-center justify-center gap-3 text-center font-bold text-ethoDark transition-shadow">
            <svg className="w-10 h-10 text-haitiBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Account Settings
          </Link>
        </div>
      </div>
    </main>
  );
}