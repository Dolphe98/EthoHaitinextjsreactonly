"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SupportPage() {
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

  if (!mounted || !token) return <div className="pt-6 lg:pt-12 min-h-screen bg-ethoBg"></div>;

  return (
    <main className="pt-6 lg:pt-12 pb-20 min-h-screen bg-ethoBg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="text-sm text-gray-500 mb-8 font-medium">
          <Link href="/account" className="hover:text-haitiBlue transition-colors">Your Account</Link>
          <span className="mx-2">›</span>
          <span className="text-ethoDark">Customer Service</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-ethoDark mb-8">Hello. What can we help you with?</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* WhatsApp Contact Box */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col p-8 text-center items-center justify-center">
            <div className="bg-green-50 p-4 rounded-full mb-6">
               <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            </div>
            <h2 className="text-xl font-bold text-ethoDark mb-2">WhatsApp Us</h2>
            <p className="text-sm text-gray-500 mb-6">Get fast help directly on your phone. We usually reply within a few hours.</p>
            
            {/* Remember to replace this link with your actual business WhatsApp number link! */}
            <a 
              href="https://wa.me/1234567890" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-auto w-full bg-green-600 hover:bg-green-700 text-white font-extrabold py-3 rounded transition-colors shadow-md"
            >
              Message on WhatsApp
            </a>
          </div>

          {/* Email Contact Box */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col p-8 text-center items-center justify-center">
            <div className="bg-red-50 p-4 rounded-full mb-6">
               <svg className="w-10 h-10 text-haitiRed" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-ethoDark mb-2">Email Support</h2>
            <p className="text-sm text-gray-500 mb-6">Prefer email? Send us your questions and order details. Allow 24-48 hours for a response.</p>
            
            {/* Remember to replace this email with your actual support email! */}
            <a 
              href="mailto:support@ethohaiti.com" 
              className="mt-auto w-full bg-haitiRed hover:bg-red-700 text-white font-extrabold py-3 rounded transition-colors shadow-md"
            >
              Email Us
            </a>
          </div>

        </div>

      </div>
    </main>
  );
}