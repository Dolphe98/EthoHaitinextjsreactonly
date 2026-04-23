"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AffiliatesPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Protect the route
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
          <span className="text-ethoDark">Affiliate Program</span>
        </nav>

        <h1 className="text-4xl font-extrabold text-ethoDark mb-4">EthoHaiti Affiliate Program</h1>
        <p className="text-xl text-gray-600 mb-10">Represent the culture and get paid to do it.</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8 sm:p-10">
          
          {/* VIDEO PLACEHOLDER */}
          <div className="w-full aspect-video bg-ethoDark rounded-xl mb-10 flex flex-col items-center justify-center shadow-inner relative overflow-hidden group border-4 border-gray-100">
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 relative z-10 backdrop-blur-sm border border-white/30">
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <p className="text-lg font-extrabold text-white relative z-10 tracking-widest uppercase">Explainer Video Coming Soon</p>
          </div>

          <div className="prose prose-lg text-gray-600 max-w-none">
            
            {/* GOAFFPRO ACTION BUTTONS */}
            <div className="bg-blue-50 border border-blue-100 p-8 rounded-xl mb-12 text-center">
              <h2 className="text-2xl font-black text-ethoDark mb-2 mt-0">Affiliate Quick Links</h2>
              <p className="text-sm text-gray-600 mb-6">Access your GoAffPro partner dashboard below.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a 
                  href="https://ethohaiti.goaffpro.com/create-account" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-haitiRed hover:bg-red-700 text-white font-extrabold py-3 px-4 rounded shadow-md transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /></svg>
                  Create Account
                </a>
                
                <a 
                  href="https://ethohaiti.goaffpro.com/login" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-ethoDark hover:bg-black text-white font-extrabold py-3 px-4 rounded shadow-md transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>
                  Affiliate Login
                </a>
                
                <a 
                  href="https://ethohaiti.goaffpro.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white border-2 border-gray-200 text-ethoDark hover:border-haitiBlue hover:text-haitiBlue font-extrabold py-3 px-4 rounded transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                  Affiliate Portal
                </a>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-ethoDark border-b-2 border-gray-100 pb-4 mb-6">How it Works</h2>
            <p>
              We believe in growing with our community. When you join the EthoHaiti Affiliate Program, you are 
              partnering directly with us to spread awareness of premium, culture-driven apparel. 
            </p>
            <p className="mt-4">
              You will receive a unique, trackable link through our GoAffPro portal. Every time someone clicks your link and makes a purchase on 
              EthoHaiti, you automatically earn a cash commission on the sale. It's that simple.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 my-10">
              <div className="text-center">
                <div className="bg-red-50 text-haitiRed w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 font-black text-2xl">1</div>
                <h3 className="font-bold text-ethoDark mb-2">Sign Up</h3>
                <p className="text-sm">Create your free partner account on our GoAffPro portal to get your unique link.</p>
              </div>
              <div className="text-center">
                <div className="bg-red-50 text-haitiRed w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 font-black text-2xl">2</div>
                <h3 className="font-bold text-ethoDark mb-2">Share Your Link</h3>
                <p className="text-sm">Post your unique link on Instagram, TikTok, YouTube, or send it directly to friends.</p>
              </div>
              <div className="text-center">
                <div className="bg-red-50 text-haitiRed w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 font-black text-2xl">3</div>
                <h3 className="font-bold text-ethoDark mb-2">Get Paid</h3>
                <p className="text-sm">Track your live sales in the portal and earn cash commissions for every order.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-ethoDark border-b-2 border-gray-100 pb-4 mb-6 mt-12">Program Rules</h2>
            <ul className="list-disc pl-6 space-y-3 mt-4">
              <li>Commissions are tracked transparently inside your affiliate dashboard.</li>
              <li>You cannot earn commissions on your own personal purchases.</li>
              <li>Payouts are subject to a standard 30-day clearing period to account for potential customer returns.</li>
              <li>Affiliates must represent the EthoHaiti brand respectfully online at all times.</li>
            </ul>

            <div className="mt-12 bg-gray-50 border border-gray-200 p-8 rounded-lg text-center">
              <h3 className="text-xl font-bold text-ethoDark mb-2">Have Questions?</h3>
              <p className="text-sm text-gray-500 mb-4">
                If you need help setting up your GoAffPro account, requesting custom promo codes, or have business inquiries, our partner team is here to help.
              </p>
              <div className="font-bold text-lg">
                <span className="text-gray-400 mr-2">Email us:</span> 
                <a href="mailto:partners@ethohaiti.com" className="text-haitiBlue hover:underline">
                  partners@ethohaiti.com
                </a>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </main>
  );
}