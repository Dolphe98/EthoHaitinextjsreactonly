"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase'; 

export default function AffiliatesPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();
  
  const [mounted, setMounted] = useState(false);

  // Application Form States
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', agreed: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  
  // UX State: Video Language Toggle
  const [activeLanguage, setActiveLanguage] = useState('kreyol');

  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.push('/account');
    }
  }, [token, router]);

  // Pre-fill email if they are logged in
  useEffect(() => {
    if (user?.email && !form.email) {
      setForm(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    if (!form.agreed) {
      return; // The button is disabled anyway, but keeping this as a fallback
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('affiliate_applications').insert({
      user_id: user?.id || null,
      full_name: form.fullName,
      email: form.email,
      phone: form.phone,
      agreed_to_terms: form.agreed
    });

    setIsSubmitting(false);

    if (error) {
      console.error("Application Error:", error);
      alert("There was an issue submitting your application. Please try again.");
    } else {
      setSubmitSuccess(true);
    }
  };

  // Video URLs (Replace these with your actual YouTube Embed URLs)
  const videoUrls = {
    kreyol: "https://www.youtube.com/embed/YOUR_KREYOL_VIDEO_ID",
    english: "https://www.youtube.com/embed/YOUR_ENGLISH_VIDEO_ID"
  };

  // High-Fidelity Skeleton Loader
  if (!mounted || !token) {
    return (
      <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-10"></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-10">
            <div className="w-full aspect-video bg-gray-200 rounded-xl mb-10"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* TERMS AND CONDITIONS MODAL (Unchanged) */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 sm:p-6 backdrop-blur-sm" onClick={() => setShowTerms(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h2 className="text-xl font-extrabold text-ethoDark">Affiliate Terms and Conditions</h2>
              <button onClick={() => setShowTerms(false)} className="text-gray-400 hover:text-haitiRed transition-colors bg-white p-2 rounded-full shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto prose prose-sm sm:prose-base text-gray-600 max-w-none">
              <p className="font-bold">Company: EthoHaiti | Effective Date: 4/26/2026 | Governing Law: Dominican Republic</p>
              
              <h3>1. ACCEPTANCE OF TERMS AND DEFINITIONS</h3>
              <p>By applying to and participating in the EthoHaiti affiliate program, you ("Partner") agree to be bound by these Terms and Conditions ("Agreement"). This Agreement constitutes a legally binding contract between you and EthoHaiti ("Company", "we", "us", or "our").</p>
              
              <h3>2. AFFILIATE PROGRAM PARTICIPATION</h3>
              <p>All prospective affiliates must complete an application process and receive formal approval before beginning promotional activities. You may not begin promoting our products or services until you have received formal approval.</p>

              <h3>3. TRACKING, ATTRIBUTION, AND CONVERSION REQUIREMENTS</h3>
              <p>Our affiliate program utilizes cookie technology to track and attribute sales. We employ a last-click attribution model with a 60-day attribution window.</p>

              <h3>4. COMMISSION STRUCTURE AND PAYMENT TERMS</h3>
              <p>Affiliates will receive a commission equal to 15% of the net sale amount for each qualifying conversion.</p>

              <h3>5. PROHIBITED PRACTICES AND COMPLIANCE</h3>
              <p><strong>Brand Bidding:</strong> Affiliates are prohibited from running Pay-Per-Click (PPC) campaigns bidding on the Company name "EthoHaiti".<br/>
              <strong>Impersonation:</strong> Affiliates may not represent themselves as the official EthoHaiti store.</p>

              <p className="font-bold mt-8 border-t pt-4">ACKNOWLEDGMENT AND ACCEPTANCE</p>
              <p>By participating in the affiliate program, you acknowledge that you have read, understood, and agree to be bound by all terms and conditions set forth in this Agreement. Your electronic acceptance through the affiliate application process constitutes your electronic signature.</p>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl text-right">
              <button onClick={() => setShowTerms(false)} className="bg-ethoDark hover:bg-black text-white font-bold py-3 px-8 rounded shadow-md transition-colors">
                Close & Return to Application
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
          <nav className="text-sm text-gray-500 mb-8 font-medium">
            <Link href="/account" className="hover:text-haitiBlue transition-colors">Your Account</Link>
            <span className="mx-2">›</span>
            <span className="text-ethoDark">Affiliate Program</span>
          </nav>

          {/* 1. THE HERO & VIDEO SECTION */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-ethoDark mb-4 uppercase tracking-tight" style={{ fontFamily: 'Oswald, sans-serif' }}>
              EthoHaiti Affiliate Program
            </h1>
            <p className="text-xl text-gray-600 font-medium">Represent the culture and get paid to do it.</p>
          </div>

          {/* 2. THE CULTURAL HOOK */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-lg text-gray-700 leading-relaxed font-medium">
              We are building an exclusive syndicate of creators, tastemakers, and cultural ambassadors. By joining the EthoHaiti family, you aren't just selling premium streetwear—you are spreading our proverbs, our history, and our pride. We give you the tools, the exclusive drops, and top-tier commissions. Watch the video, read the terms, and let’s build together.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6 sm:p-10 mb-12">
            
            {/* Language Toggle */}
            <div className="flex bg-gray-100 rounded-full p-1 w-max mx-auto mb-6 border border-gray-200 shadow-inner">
              <button 
                onClick={() => setActiveLanguage('kreyol')} 
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeLanguage === 'kreyol' ? 'bg-white text-ethoDark shadow-sm' : 'text-gray-500 hover:text-ethoDark'}`}
              >
                🇭🇹 Kreyòl
              </button>
              <button 
                onClick={() => setActiveLanguage('english')} 
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeLanguage === 'english' ? 'bg-white text-ethoDark shadow-sm' : 'text-gray-500 hover:text-ethoDark'}`}
              >
                🇺🇸 English
              </button>
            </div>

            <h2 className="text-center text-xl font-bold text-ethoDark mb-6">Our Affiliate Program Explained</h2>

            {/* Cinematic Video Player */}
            <div className="w-full aspect-video bg-black rounded-xl mb-12 shadow-lg border border-gray-200 overflow-hidden relative">
              {/* Replace with actual iframe when ready */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/50 font-bold tracking-widest uppercase">Video Player ({activeLanguage})</span>
              </div>
            </div>

            {/* 3. THE 5-STEP VISUAL GUIDE */}
            <div className="mb-16">
              <h3 className="text-2xl font-black text-ethoDark mb-8 text-center">How it Works</h3>
              
              <div className="flex flex-col md:flex-row gap-6 md:gap-4 relative">
                {/* Steps */}
                {[
                  { title: "Watch & Learn", desc: "Watch the explainer video above. It’s mandatory for all new affiliates." },
                  { title: "Agree & Apply", desc: "Accept the Terms & Conditions below by entering your details." },
                  { title: "Access the Portal", desc: "Create your official account on our GoAffPro platform to get your tracking links." },
                  { title: "Rep & Promote", desc: "Share your links and promo codes with your audience." },
                  { title: "Get Paid", desc: "Earn a cash commission on every single purchase made through your link." }
                ].map((step, index) => (
                  <div key={index} className="flex-1 flex flex-col md:items-center relative z-10 md:text-center group">
                    <div className="w-12 h-12 bg-gray-50 border-2 border-gray-200 text-gray-400 group-hover:border-haitiRed group-hover:text-haitiRed group-hover:bg-red-50 rounded-full flex items-center justify-center font-black text-xl mb-4 transition-colors shrink-0">
                      {index + 1}
                    </div>
                    <div className="ml-4 md:ml-0 flex-1">
                      <h4 className="font-bold text-ethoDark mb-1 text-sm">{step.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. THE AGREEMENT FORM OR 5. THE GOAFFPRO GATEWAY */}
            {!submitSuccess ? (
              <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                  <svg className="w-8 h-8 text-haitiRed" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                  <h2 className="text-2xl font-black text-ethoDark m-0">Step 2: Ambassador Agreement</h2>
                </div>
                
                <form onSubmit={handleApplicationSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-ethoDark mb-2">Full Name <span className="text-haitiRed">*</span></label>
                      <input 
                        type="text" 
                        value={form.fullName} 
                        onChange={(e) => setForm({...form, fullName: e.target.value})} 
                        placeholder="First and Last Name" 
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-ethoDark mb-2">Email Address <span className="text-haitiRed">*</span></label>
                      <input 
                        type="email" 
                        value={form.email} 
                        onChange={(e) => setForm({...form, email: e.target.value})} 
                        placeholder="your@email.com" 
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-ethoDark mb-2">Phone Number <span className="text-haitiRed">*</span></label>
                      <input 
                        type="tel" 
                        value={form.phone} 
                        onChange={(e) => setForm({...form, phone: e.target.value})} 
                        placeholder="(555) 555-5555" 
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-white p-5 rounded border border-gray-200 mt-4 shadow-sm hover:border-haitiBlue transition-colors">
                    <input 
                      type="checkbox" 
                      id="termsAgreed"
                      checked={form.agreed}
                      onChange={(e) => setForm({...form, agreed: e.target.checked})}
                      className="mt-1 w-6 h-6 text-haitiRed focus:ring-haitiRed rounded cursor-pointer"
                    />
                    <label htmlFor="termsAgreed" className="text-sm text-gray-700 cursor-pointer select-none leading-relaxed flex-1">
                      I have read and agree to the EthoHaiti{' '}
                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTerms(true); }} className="text-haitiBlue font-bold hover:underline">
                        Affiliate Terms & Conditions
                      </button>.
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={!form.agreed || isSubmitting}
                    className={`w-full py-4 rounded font-extrabold text-white transition-all shadow-md mt-4 text-lg ${
                      !form.agreed ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 
                      isSubmitting ? 'bg-gray-400 cursor-wait' : 'bg-haitiRed hover:bg-red-700'
                    }`}
                  >
                    {isSubmitting ? 'Processing...' : 'Accept & Continue to Portal'}
                  </button>
                </form>
              </div>
            ) : (
              // THE FUNNEL LOCK: Only shows after successful form submission
              <div className="bg-green-50 border border-green-200 p-8 rounded-xl text-center shadow-inner animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-green-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                </div>
                <h2 className="text-3xl font-black text-green-800 mb-2">Agreement Accepted!</h2>
                <p className="text-green-700 font-medium mb-8 text-lg">Welcome to the syndicate. Access your tools below.</p>

                <div className="flex flex-col gap-4 max-w-sm mx-auto">
                  <a 
                    href="https://ethohaiti.goaffpro.com/create-account" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-haitiRed hover:bg-red-700 text-white font-extrabold py-4 px-6 rounded shadow-md transition-colors text-base flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /></svg>
                    Create Affiliate Account
                  </a>
                  
                  <a 
                    href="https://ethohaiti.goaffpro.com/login" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-ethoDark hover:bg-black text-white font-extrabold py-4 px-6 rounded shadow-md transition-colors text-base flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>
                    Login to Portal
                  </a>
                  
                  <a 
                    href="https://ethohaiti.goaffpro.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white border-2 border-gray-200 text-ethoDark hover:border-haitiBlue hover:text-haitiBlue font-extrabold py-3 px-6 rounded transition-colors text-sm flex items-center justify-center gap-2 mt-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                    View Dashboard
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* 6. SUPPORT & HELP FOOTER */}
          <div className="bg-white border border-gray-200 p-8 rounded-2xl text-center shadow-sm max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-ethoDark mb-2">Have questions before joining?</h3>
            <p className="text-gray-500 mb-6 font-medium">
              Our ambassador support team is here for you.
            </p>
            <a 
              href="mailto:partners@ethohaiti.com" 
              className="inline-flex items-center justify-center gap-2 text-haitiBlue hover:text-blue-800 font-extrabold text-lg transition-colors bg-blue-50 px-6 py-3 rounded-full hover:bg-blue-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
              partners@ethohaiti.com
            </a>
          </div>

        </div>
      </main>
    </>
  );
}