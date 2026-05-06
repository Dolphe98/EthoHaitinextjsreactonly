"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AffiliateTermsContent from '@/components/ui/AffiliateTermsContent';

export default function AffiliateTermsPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Protect the route so only logged-in users/partners can see it
    if (!token) {
      router.push('/account');
    }
  }, [token, router]);

  if (!mounted || !token) {
    return (
      <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 h-[600px]"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="text-sm md:text-base text-gray-500 mb-10 font-medium">
          <Link href="/account" className="hover:text-haitiBlue transition-colors">Your Account</Link>
          <span className="mx-3">›</span>
          <Link href="/affiliates" className="hover:text-haitiBlue transition-colors">Affiliate Program</Link>
          <span className="mx-3">›</span>
          <span className="text-ethoDark">Terms and Conditions</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden p-8 sm:p-16 mb-12">
          
          {/* Using prose-xl makes the entire text much larger and easier to read */}
          <div className="prose prose-xl max-w-none text-gray-700 leading-relaxed">
            <AffiliateTermsContent />
          </div>
          
        </div>
      </div>
    </main>
  );
}