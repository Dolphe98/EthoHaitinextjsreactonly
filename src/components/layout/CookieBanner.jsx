"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already accepted cookies
    const consent = localStorage.getItem('etho-cookie-consent');
    if (!consent) {
      // Delay showing it for a second so it feels smooth, not aggressive
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('etho-cookie-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[340px] bg-white rounded-xl shadow-2xl border border-gray-200 p-5 z-[9999] animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-extrabold text-ethoDark text-sm">We value your privacy</h3>
        <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-haitiRed transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        We use cookies to enhance your browsing experience, serve personalized ads, and analyze our traffic. By continuing to use our site, you consent to our <Link href="/cookies" className="text-haitiBlue font-bold hover:underline">Cookie Policy</Link>.
      </p>
      <button
        onClick={acceptCookies}
        className="w-full bg-ethoDark hover:bg-black text-white text-sm font-extrabold py-2.5 rounded-lg transition-colors shadow-sm"
      >
        Accept & Continue
      </button>
    </div>
  );
}