"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase'; // MANAGER FIX: Imported Supabase

export default function AffiliatesPage() {
  const { token, user } = useAuthStore(); // MANAGER FIX: Added user to prefill email
  const router = useRouter();
  const supabase = createClient();
  
  const [mounted, setMounted] = useState(false);

  // Application Form States
  const [form, setForm] = useState({ fullName: '', email: '', agreed: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Protect the route
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
      alert("You must agree to the Terms and Conditions to apply.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('affiliate_applications').insert({
      user_id: user?.id || null,
      full_name: form.fullName,
      email: form.email,
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

  // MANAGER FIX: Replaced "white screen of death" with a High-Fidelity Skeleton Loader
  if (!mounted || !token) {
    return (
      <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-10"></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-10">
            <div className="w-full aspect-video bg-gray-200 rounded-xl mb-10"></div>
            <div className="h-48 bg-gray-100 rounded-xl mb-12"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* MANAGER FIX: TERMS AND CONDITIONS MODAL */}
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
              <p><strong>Definitions:</strong><br/>
              "Company" refers to EthoHaiti, the operator and owner of this affiliate program.<br/>
              "Partner" refers to any individual or business entity that has been accepted into and participates in the Company's affiliate marketing program.<br/>
              "Program" refers to the EthoHaiti affiliate marketing program described in this Agreement.<br/>
              "Products/Services" refers to the physical products offered and sold by the Company.<br/>
              "Affiliate Link" refers to the unique tracking link provided to the Affiliate for promoting the Company's products or services.<br/>
              "Commission" refers to the compensation paid to Affiliate for qualified referrals as defined herein.</p>

              <h3>2. AFFILIATE PROGRAM PARTICIPATION</h3>
              <h4>2.1 Eligibility Requirements</h4>
              <p>To participate in our affiliate program, you must be at least 18 years of age, have an active social media presence or website, and have the legal capacity to enter into this Agreement. The Company reserves the right, in its sole discretion, to accept or reject any affiliate application. We may terminate or suspend any affiliate's participation at any time for any reason, including but not limited to violations of this Agreement or conduct that we deem harmful to our business or reputation.</p>
              
              <h4>2.2 Application and Approval Process</h4>
              <p>All prospective affiliates must complete an application process and receive formal approval before beginning promotional activities. Upon approval, you will receive access to your affiliate dashboard, promotional materials, and your unique affiliate tracking links. You may not begin promoting our products or services until you have received formal approval.</p>

              <h3>3. TRACKING, ATTRIBUTION, AND CONVERSION REQUIREMENTS</h3>
              <h4>3.1 Tracking Technology and Attribution Model</h4>
              <p>Our affiliate program utilizes cookie technology to track and attribute sales. All referrals must be made through your approved affiliate links to qualify for commission payments. We employ a last-click attribution model with a 60-day attribution window. If a customer clicks on your affiliate link and makes a qualifying purchase within 60 days of that initial click, you will receive credit for that conversion.</p>
              
              <h4>3.2 Conversion and Commission Eligibility</h4>
              <p>Only legitimate sales generated through your approved affiliate links will qualify for commission payments. The customer must be new or meet the specific requirements outlined in your affiliate dashboard. Additionally, the purchase must not be refunded, charged back, or otherwise reversed during the validation period.</p>

              <h3>4. COMMISSION STRUCTURE AND PAYMENT TERMS</h3>
              <h4>4.1 Commission Rates and Structure</h4>
              <p>Affiliates will receive a commission equal to 15% of the net sale amount for each qualifying conversion. The commission percentage applies to the actual purchase price paid by the customer, excluding taxes, shipping fees, and any discounts or refunds.</p>
              
              <h4>4.2 Payment Schedule and Methods</h4>
              <p>Commission payments are processed on a monthly basis. Payments will be made approximately 30 days after the end of each payment period.<br/>
              <strong>Minimum Payout Threshold:</strong> You must accumulate at least USD 20 in eligible commissions before a payment will be issued. If your balance is below this threshold, your earnings will roll over to the next period.<br/>
              <strong>Available Payment Methods:</strong> Payments are issued via PayPal in USD and other.</p>
              
              <h4>4.3 Commission Validation and Holding Period</h4>
              <p>All sales are subject to a 30-day validation period to allow for potential returns or chargebacks. During this period, commissions will be held in a "pending" status. In the event of a chargeback, refund, or return on a print-on-demand order, any commissions credited to the affiliate for that specific sale will be voided and deducted from their pending balance.</p>

              <h3>5. PROHIBITED PRACTICES AND COMPLIANCE</h3>
              <h4>5.1 Prohibited Marketing Practices</h4>
              <p>To maintain the integrity of our brand, the following practices are strictly prohibited:<br/>
              <strong>Brand Bidding:</strong> Affiliates are prohibited from running Pay-Per-Click (PPC) campaigns (such as Google Ads or Bing Ads) bidding on the Company name "EthoHaiti", trademarked terms, brand names, or any variations thereof.<br/>
              <strong>Impersonation:</strong> Affiliates may not represent themselves as the official EthoHaiti store. Affiliates are prohibited from creating social media accounts, domains, or pages that include "EthoHaiti" in the handle or URL in a way that implies they are the official brand.<br/>
              <strong>Spam and Fraud:</strong> The use of bots, click farms, automated traffic generation, incentivized clicks, or unsolicited spam emails is strictly prohibited.</p>
              
              <h4>5.2 Legal Compliance and Disclosure Requirements</h4>
              <p>You must clearly and conspicuously disclose your affiliate relationship with the Company in all promotional materials. This includes using hashtags such as #ad, #affiliate, or #sponsored in social media posts, videos, and other promotional content in accordance with FTC guidelines.</p>

              <h3>6. MARKETING MATERIALS AND BRAND USAGE</h3>
              <h4>6.1 Approved Materials</h4>
              <p>Affiliates may only use pre-approved banners, images, and promotional content provided in the affiliate portal. Modification of provided materials or logos requires written approval from the Company.</p>
              
              <h4>6.2 Discount Codes</h4>
              <p>If provided with custom discount codes, they are for your promotional use only. Submitting your exclusive discount codes to third-party coupon sites (e.g., Honey, RetailMeNot) is strictly prohibited and will result in immediate termination and forfeiture of pending commissions.</p>

              <h3>7. TERM, TERMINATION, AND SURVIVAL</h3>
              <p>Either party may terminate this Agreement at any time, with or without cause, and without prior notice. Upon termination, you must immediately cease all promotional activities, remove all affiliate links, and discontinue use of our marketing materials. All pending commissions will be forfeited upon termination if the termination is due to a violation of these terms.</p>

              <h3>8. GOVERNING LAW AND DISPUTES</h3>
              <p>These terms are governed by the laws of the Dominican Republic, specifically the jurisdiction of Santo Domingo, Distrito Nacional. Any disputes arising from this agreement will be resolved in this jurisdiction.</p>

              <h3>9. CONTACT INFORMATION</h3>
              <p>For questions regarding these terms or the affiliate program:<br/>
              EthoHaiti Email: partners@ethohaiti.com<br/>
              Website: https://www.ethohaiti.com/affiliates</p>

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

            {/* MANAGER FIX: OFFICIAL APPLICATION FORM */}
            {!submitSuccess ? (
              <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl mb-12">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                  <svg className="w-8 h-8 text-haitiRed" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <h2 className="text-2xl font-black text-ethoDark m-0">Step 1: Official Application</h2>
                </div>
                
                <form onSubmit={handleApplicationSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                  </div>
                  
                  <div className="flex items-start gap-3 bg-white p-4 rounded border border-gray-200 mt-2">
                    <input 
                      type="checkbox" 
                      id="termsAgreed"
                      checked={form.agreed}
                      onChange={(e) => setForm({...form, agreed: e.target.checked})}
                      className="mt-1 w-5 h-5 text-haitiBlue focus:ring-haitiBlue rounded cursor-pointer"
                    />
                    <label htmlFor="termsAgreed" className="text-sm text-gray-700 cursor-pointer select-none leading-relaxed">
                      I have read, understood, and agree to be bound by the EthoHaiti{' '}
                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTerms(true); }} className="text-haitiBlue font-bold hover:underline">
                        Affiliate Program Terms and Conditions
                      </button>. I understand that this constitutes my legally binding electronic signature.
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded font-extrabold text-white transition-all shadow-md mt-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-ethoDark hover:bg-black text-lg'}`}
                  >
                    {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 p-8 rounded-xl mb-12 text-center shadow-inner">
                <div className="w-16 h-16 bg-white text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                </div>
                <h2 className="text-2xl font-black text-green-800 mb-2">Application Received!</h2>
                <p className="text-green-700 font-medium">Thank you for applying. Proceed to Step 2 below to create your GoAffPro account while we review your profile.</p>
              </div>
            )}

            {/* GOAFFPRO ACTION BUTTONS */}
            <div className="bg-blue-50 border border-blue-100 p-8 rounded-xl mb-12 text-center">
              <h2 className="text-2xl font-black text-ethoDark mb-2 mt-0">Step 2: Affiliate Quick Links</h2>
              <p className="text-sm text-gray-600 mb-6">Create or access your GoAffPro partner dashboard below.</p>
              
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

            <div className="prose prose-lg text-gray-600 max-w-none">
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
    </>
  );
}