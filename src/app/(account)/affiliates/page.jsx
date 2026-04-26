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
  const [isChecking, setIsChecking] = useState(true);

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

  // NEW BULLETPROOF CHECK: Database + Local Storage
  useEffect(() => {
    async function checkExistingApplication() {
      // 1. Check local storage first (Lightning fast)
      const localCheck = localStorage.getItem('etho_partner_applied');
      if (localCheck === 'true') {
        setSubmitSuccess(true);
        setIsChecking(false);
        return;
      }

      // 2. If not in local storage, check the database securely
      if (user?.id) {
        try {
          const { data } = await supabase
            .from('affiliate_applications')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle(); 

          if (data) {
            // Remember it in the browser for next time
            localStorage.setItem('etho_partner_applied', 'true');
            setSubmitSuccess(true); 
          }
        } catch (error) {
          console.error("Error checking application status:", error);
        }
      }
      setIsChecking(false); 
    }

    if (mounted && token && user?.id) {
      checkExistingApplication();
    } else if (mounted && !token) {
      setIsChecking(false);
    }
  }, [mounted, token, user, supabase]);

  // Pre-fill email if they are logged in
  useEffect(() => {
    if (user?.email && !form.email) {
      setForm(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    if (!form.agreed) {
      return; 
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
      // 3. Save memory instantly on successful submit
      localStorage.setItem('etho_partner_applied', 'true');
      setSubmitSuccess(true);
    }
  };

  const videoUrls = {
    kreyol: "https://www.youtube.com/embed/YOUR_KREYOL_VIDEO_ID",
    english: "https://www.youtube.com/embed/YOUR_ENGLISH_VIDEO_ID"
  };

  if (!mounted || !token || isChecking) {
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
      {/* TERMS AND CONDITIONS MODAL */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 sm:p-6 backdrop-blur-sm" onClick={() => setShowTerms(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h2 className="text-xl font-extrabold text-ethoDark">Partner Terms and Conditions</h2>
              <button onClick={() => setShowTerms(false)} className="text-gray-400 hover:text-haitiRed transition-colors bg-white p-2 rounded-full shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto prose prose-sm sm:prose-base text-gray-600 max-w-none space-y-4">
              <p className="font-bold text-ethoDark">Company: EthoHaiti | Effective Date: 4/26/2026 | Governing Law: Dominican Republic</p>
              
              <h3 className="font-bold text-lg text-ethoDark mt-6">1. ACCEPTANCE OF TERMS AND DEFINITIONS</h3>
              <p>By applying to and participating in the EthoHaiti affiliate program, you ("Partner") agree to be bound by these Terms and Conditions ("Agreement"). This Agreement constitutes a legally binding contract between you and EthoHaiti ("Company", "we", "us", or "our").</p>
              <p className="font-bold">Definitions:</p>
              <ul className="list-disc pl-5">
                <li><strong>"Company"</strong> refers to EthoHaiti, the operator and owner of this affiliate program.</li>
                <li><strong>"Partner"</strong> refers to any individual or business entity that has been accepted into and participates in the Company's affiliate marketing program.</li>
                <li><strong>"Program"</strong> refers to the EthoHaiti affiliate marketing program described in this Agreement.</li>
                <li><strong>"Products/Services"</strong> refers to the physical products offered and sold by the Company.</li>
                <li><strong>"Affiliate Link"</strong> refers to the unique tracking link provided to the Affiliate for promoting the Company's products or services.</li>
                <li><strong>"Commission"</strong> refers to the compensation paid to Affiliate for qualified referrals as defined herein.</li>
              </ul>

              <h3 className="font-bold text-lg text-ethoDark mt-6">2. AFFILIATE PROGRAM PARTICIPATION</h3>
              <p className="font-bold">2.1 Eligibility Requirements</p>
              <p>To participate in our affiliate program, you must be at least 18 years of age, have an active social media presence or website, and have the legal capacity to enter into this Agreement.</p>
              <p>The Company reserves the right, in its sole discretion, to accept or reject any affiliate application. We may terminate or suspend any affiliate's participation at any time for any reason, including but not limited to violations of this Agreement or conduct that we deem harmful to our business or reputation.</p>
              <p className="font-bold mt-4">2.2 Application and Approval Process</p>
              <p>All prospective affiliates must complete an application process and receive formal approval before beginning promotional activities. Upon approval, you will receive access to your affiliate dashboard, promotional materials, and your unique affiliate tracking links. You may not begin promoting our products or services until you have received formal approval.</p>

              <h3 className="font-bold text-lg text-ethoDark mt-6">3. TRACKING, ATTRIBUTION, AND CONVERSION REQUIREMENTS</h3>
              <p className="font-bold">3.1 Tracking Technology and Attribution Model</p>
              <p>Our affiliate program utilizes cookie technology to track and attribute sales. All referrals must be made through your approved affiliate links to qualify for commission payments.</p>
              <p>We employ a last-click attribution model with a 60-day attribution window. If a customer clicks on your affiliate link and makes a qualifying purchase within 60 days of that initial click, you will receive credit for that conversion.</p>
              <p className="font-bold mt-4">3.2 Conversion and Commission Eligibility</p>
              <p>Only legitimate sales generated through your approved affiliate links will qualify for commission payments. The customer must be new or meet the specific requirements outlined in your affiliate dashboard. Additionally, the purchase must not be refunded, charged back, or otherwise reversed during the validation period.</p>

              <h3 className="font-bold text-lg text-ethoDark mt-6">4. COMMISSION STRUCTURE AND PAYMENT TERMS</h3>
              <p className="font-bold">4.1 Commission Rates and Structure</p>
              <p>Affiliates will receive a commission equal to 15% of the net sale amount for each qualifying conversion. The commission percentage applies to the actual purchase price paid by the customer, excluding taxes, shipping fees, and any discounts or refunds.</p>
              <p className="font-bold mt-4">4.2 Payment Schedule and Methods</p>
              <p>Commission payments are processed on a monthly basis. Payments will be made approximately 30 days after the end of each payment period.</p>
              <p><strong>Minimum Payout Threshold:</strong> You must accumulate at least USD 20 in eligible commissions before a payment will be issued. If your balance is below this threshold, your earnings will roll over to the next period. Available Payment Methods: Payments are issued via PayPal in USD and other.</p>
              <p className="font-bold mt-4">4.3 Commission Validation and Holding Period</p>
              <p>All sales are subject to a 30-day validation period to allow for potential returns or chargebacks. During this period, commissions will be held in a "pending" status. In the event of a chargeback, refund, or return on a print-on-demand order, any commissions credited to the affiliate for that specific sale will be voided and deducted from their pending balance.</p>

              <h3 className="font-bold text-lg text-ethoDark mt-6">5. PROHIBITED PRACTICES AND COMPLIANCE</h3>
              <p className="font-bold">5.1 Prohibited Marketing Practices</p>
              <p>To maintain the integrity of our brand, the following practices are strictly prohibited:</p>
              <ul className="list-disc pl-5">
                <li><strong>Brand Bidding:</strong> Affiliates are prohibited from running Pay-Per-Click (PPC) campaigns (such as Google Ads or Bing Ads) bidding on the Company name "EthoHaiti", trademarked terms, brand names, or any variations thereof.</li>
                <li><strong>Impersonation:</strong> Affiliates may not represent themselves as the official EthoHaiti store. Affiliates are prohibited from creating social media accounts, domains, or pages that include "EthoHaiti" in the handle or URL in a way that implies they are the official brand.</li>
                <li><strong>Spam and Fraud:</strong> The use of bots, click farms, automated traffic generation, incentivized clicks, or unsolicited spam emails is strictly prohibited.</li>
              </ul>
              <p className="font-bold mt-4">5.2 Legal Compliance and Disclosure Requirements</p>
              <p>You must clearly and conspicuously disclose your affiliate relationship with the Company in all promotional materials. This includes using hashtags such as #ad, #affiliate, or #sponsored in social media posts, videos, and other promotional content in accordance with FTC guidelines.</p>

              <h3 className="font-bold text-lg text-ethoDark mt-6">6. MARKETING MATERIALS AND BRAND USAGE</h3>
              <p className="font-bold">6.1 Approved Materials</p>
              <p>Affiliates may only use pre-approved banners, images, and promotional content provided in the affiliate portal. Modification of provided materials or logos requires written approval from the Company.</p>
              <p className="font-bold mt-4">6.2 Discount Codes</p>
              <p>If provided with custom discount codes, they are for your promotional use only. Submitting your exclusive discount codes to third-party coupon sites (e.g., Honey, RetailMeNot) is strictly prohibited and will result in immediate termination and forfeiture of pending commissions.</p>

              <h3 className="font-bold text-lg text-ethoDark mt-6">7. TERM, TERMINATION, AND SURVIVAL</h3>
              <p>Either party may terminate this Agreement at any time, with or without cause, and without prior notice. Upon termination, you must immediately cease all promotional activities, remove all affiliate links, and discontinue use of our marketing materials. All pending commissions will be forfeited upon termination if the termination is due to a violation of these terms.</p>

              <h3 className="font-bold text-lg text-ethoDark mt-6">8. GOVERNING LAW AND DISPUTES</h3>
              <p>These terms are governed by the laws of the Dominican Republic, specifically the jurisdiction of Santo Domingo, Distrito Nacional. Any disputes arising from this agreement will be resolved in this jurisdiction.</p>

              <h3 className="font-bold text-lg text-ethoDark mt-6">9. CONTACT INFORMATION</h3>
              <p>For questions regarding these terms or the affiliate program:<br/>
              EthoHaiti Email: <a href="mailto:partners@ethohaiti.com" className="text-haitiBlue hover:underline">partners@ethohaiti.com</a><br/>
              Website: <a href="https://www.ethohaiti.com/affiliates" className="text-haitiBlue hover:underline">https://www.ethohaiti.com/affiliates</a></p>

              <div className="bg-gray-100 p-4 rounded-lg mt-6 text-center">
                <p className="font-bold text-ethoDark">ACKNOWLEDGMENT AND ACCEPTANCE</p>
                <p className="text-sm">By participating in the affiliate program, you acknowledge that you have read, understood, and agree to be bound by all terms and conditions set forth in this Agreement. Your electronic acceptance through the affiliate application process constitutes your electronic signature.</p>
              </div>
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
            <span className="text-ethoDark">Partner Program</span>
          </nav>

          {/* 1. THE HERO & VIDEO SECTION */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-ethoDark mb-4 uppercase tracking-tight" style={{ fontFamily: 'Oswald, sans-serif' }}>
              EthoHaiti Partner Program
            </h1>
            <p className="text-xl text-gray-600 font-medium">Represent the culture and get paid to do it.</p>
          </div>

          {/* 2. THE CULTURAL HOOK */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-lg text-gray-700 leading-relaxed font-medium">
              We are building an exclusive syndicate of creators and cultural partners. By joining the EthoHaiti family, you aren't just selling premium streetwear—you are spreading our proverbs, our history, and our pride. We give you the tools, the exclusive drops, and top-tier commissions. Watch the video, read the terms, and let’s build together.
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

            <h2 className="text-center text-xl font-bold text-ethoDark mb-6">Our Partner Program Explained</h2>

            {/* Cinematic Video Player */}
            <div className="w-full aspect-video bg-black rounded-xl mb-12 shadow-lg border border-gray-200 overflow-hidden relative">
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
                  { title: "Watch & Learn", desc: "Watch the explainer video above. It’s mandatory for all new partners." },
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
                  <h2 className="text-2xl font-black text-ethoDark m-0">Step 2: Partner Agreement</h2>
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
                        Partner Terms & Conditions
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
              // THE FUNNEL LOCK: Only shows after successful form submission or if already applied in DB
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
                    Create Partner Account
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
              Our partner support team is here for you.
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