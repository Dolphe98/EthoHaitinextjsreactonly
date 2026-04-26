"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
          
          <div className="border-b-2 border-gray-100 pb-10 mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-ethoDark mb-6 uppercase tracking-tight" style={{ fontFamily: 'Oswald, sans-serif' }}>
              AFFILIATE PROGRAM TERMS AND CONDITIONS
            </h1>
            <div className="text-lg md:text-xl text-gray-500 font-bold flex flex-col md:flex-row justify-center gap-2 md:gap-6">
              <span>Company: EthoHaiti</span>
              <span className="hidden md:inline">•</span>
              <span>Effective Date: 4/26/2026</span>
              <span className="hidden md:inline">•</span>
              <span>Governing Law: Dominican Republic</span>
            </div>
          </div>
          
          {/* Using prose-xl makes the entire text much larger and easier to read */}
          <div className="prose prose-xl max-w-none text-gray-700 leading-relaxed space-y-8">
            
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-ethoDark mb-4">1. ACCEPTANCE OF TERMS AND DEFINITIONS</h2>
              <p>By applying to and participating in the EthoHaiti affiliate program, you ("Partner") agree to be bound by these Terms and Conditions ("Agreement"). This Agreement constitutes a legally binding contract between you and EthoHaiti ("Company", "we", "us", or "our").</p>
              <p className="font-bold mt-6 mb-2">Definitions:</p>
              <ul className="list-none space-y-3 pl-0">
                <li><strong>"Company"</strong> refers to EthoHaiti, the operator and owner of this affiliate program.</li>
                <li><strong>"Partner"</strong> refers to any individual or business entity that has been accepted into and participates in the Company's affiliate marketing program.</li>
                <li><strong>"Program"</strong> refers to the EthoHaiti affiliate marketing program described in this Agreement.</li>
                <li><strong>"Products/Services"</strong> refers to the physical products offered and sold by the Company.</li>
                <li><strong>"Affiliate Link"</strong> refers to the unique tracking link provided to the Affiliate for promoting the Company's products or services.</li>
                <li><strong>"Commission"</strong> refers to the compensation paid to Affiliate for qualified referrals as defined herein.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-black text-ethoDark mb-4 mt-12">2. AFFILIATE PROGRAM PARTICIPATION</h2>
              <h3 className="text-xl md:text-2xl font-bold text-ethoDark mb-3">2.1 Eligibility Requirements</h3>
              <p>To participate in our affiliate program, you must be at least 18 years of age, have an active social media presence or website, and have the legal capacity to enter into this Agreement.</p>
              <p className="mt-4">The Company reserves the right, in its sole discretion, to accept or reject any affiliate application. We may terminate or suspend any affiliate's participation at any time for any reason, including but not limited to violations of this Agreement or conduct that we deem harmful to our business or reputation.</p>
              
              <h3 className="text-xl md:text-2xl font-bold text-ethoDark mb-3 mt-8">2.2 Application and Approval Process</h3>
              <p>All prospective affiliates must complete an application process and receive formal approval before beginning promotional activities. Upon approval, you will receive access to your affiliate dashboard, promotional materials, and your unique affiliate tracking links. You may not begin promoting our products or services until you have received formal approval.</p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-black text-ethoDark mb-4 mt-12">3. TRACKING, ATTRIBUTION, AND CONVERSION REQUIREMENTS</h2>
              <h3 className="text-xl md:text-2xl font-bold text-ethoDark mb-3">3.1 Tracking Technology and Attribution Model</h3>
              <p>Our affiliate program utilizes cookie technology to track and attribute sales. All referrals must be made through your approved affiliate links to qualify for commission payments.</p>
              <p className="mt-4">We employ a last-click attribution model with a 60-day attribution window. If a customer clicks on your affiliate link and makes a qualifying purchase within 60 days of that initial click, you will receive credit for that conversion.</p>
              
              <h3 className="text-xl md:text-2xl font-bold text-ethoDark mb-3 mt-8">3.2 Conversion and Commission Eligibility</h3>
              <p>Only legitimate sales generated through your approved affiliate links will qualify for commission payments. The customer must be new or meet the specific requirements outlined in your affiliate dashboard. Additionally, the purchase must not be refunded, charged back, or otherwise reversed during the validation period.</p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-black text-ethoDark mb-4 mt-12">4. COMMISSION STRUCTURE AND PAYMENT TERMS</h2>
              <h3 className="text-xl md:text-2xl font-bold text-ethoDark mb-3">4.1 Commission Rates and Structure</h3>
              <p>Affiliates will receive a commission equal to 15% of the net sale amount for each qualifying conversion. The commission percentage applies to the actual purchase price paid by the customer, excluding taxes, shipping fees, and any discounts or refunds.</p>
              
              <h3 className="text-xl md:text-2xl font-bold text-ethoDark mb-3 mt-8">4.2 Payment Schedule and Methods</h3>
              <p>Commission payments are processed on a monthly basis. Payments will be made approximately 30 days after the end of each payment period.</p>
              <p className="mt-4"><strong>Minimum Payout Threshold:</strong> You must accumulate at least USD 20 in eligible commissions before a payment will be issued. If your balance is below this threshold, your earnings will roll over to the next period.</p>
              <p className="mt-4"><strong>Available Payment Methods:</strong> Payments are issued via PayPal in USD and other.</p>
              
              <h3 className="text-xl md:text-2xl font-bold text-ethoDark mb-3 mt-8">4.3 Commission Validation and Holding Period</h3>
              <p>All sales are subject to a 30-day validation period to allow for potential returns or chargebacks. During this period, commissions will be held in a "pending" status. In the event of a chargeback, refund, or return on a print-on-demand order, any commissions credited to the affiliate for that specific sale will be voided and deducted from their pending balance.</p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-black text-ethoDark mb-4 mt-12">5. PROHIBITED PRACTICES AND COMPLIANCE</h2>
              <h3 className="text-xl md:text-2xl font-bold text-ethoDark mb-3">5.1 Prohibited Marketing Practices</h3>
              <p>To maintain the integrity of our brand, the following practices are strictly prohibited:</p>
              <ul className="list-disc pl-8 space-y-4 mt-4">
                <li><strong>Brand Bidding:</strong> Affiliates are prohibited from running Pay-Per-Click (PPC) campaigns (such as Google Ads or Bing Ads) bidding on the Company name "EthoHaiti", trademarked terms, brand names, or any variations thereof.</li>
                <li><strong>Impersonation:</strong> Affiliates may not represent themselves as the official EthoHaiti store. Affiliates are prohibited from creating social media accounts, domains, or pages that include "EthoHaiti" in the handle or URL in a way that implies they are the official brand.</li>
                <li><strong>Spam and Fraud:</strong> The use of bots, click farms, automated traffic generation, incentivized clicks, or unsolicited spam emails is strictly prohibited.</li>
              </ul>
              
              <h3 className="text-xl md:text-2xl font-bold text-ethoDark mb-3 mt-8">5.2 Legal Compliance and Disclosure Requirements</h3>
              <p>You must clearly and conspicuously disclose your affiliate relationship with the Company in all promotional materials. This includes using hashtags such as #ad, #affiliate, or #sponsored in social media posts, videos, and other promotional content in accordance with FTC guidelines.</p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-black text-ethoDark mb-4 mt-12">6. MARKETING MATERIALS AND BRAND USAGE</h2>
              <h3 className="text-xl md:text-2xl font-bold text-ethoDark mb-3">6.1 Approved Materials</h3>
              <p>Affiliates may only use pre-approved banners, images, and promotional content provided in the affiliate portal.</p>
              <p className="mt-4">Modification of provided materials or logos requires written approval from the Company.</p>
              
              <h3 className="text-xl md:text-2xl font-bold text-ethoDark mb-3 mt-8">6.2 Discount Codes</h3>
              <p>If provided with custom discount codes, they are for your promotional use only.</p>
              <p className="mt-4">Submitting your exclusive discount codes to third-party coupon sites (e.g., Honey, RetailMeNot) is strictly prohibited and will result in immediate termination and forfeiture of pending commissions.</p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-black text-ethoDark mb-4 mt-12">7. TERM, TERMINATION, AND SURVIVAL</h2>
              <p>Either party may terminate this Agreement at any time, with or without cause, and without prior notice. Upon termination, you must immediately cease all promotional activities, remove all affiliate links, and discontinue use of our marketing materials. All pending commissions will be forfeited upon termination if the termination is due to a violation of these terms.</p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-black text-ethoDark mb-4 mt-12">8. GOVERNING LAW AND DISPUTES</h2>
              <p>These terms are governed by the laws of the Dominican Republic, specifically the jurisdiction of Santo Domingo, Distrito Nacional. Any disputes arising from this agreement will be resolved in this jurisdiction.</p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-black text-ethoDark mb-4 mt-12">9. CONTACT INFORMATION</h2>
              <p>For questions regarding these terms or the affiliate program:</p>
              <ul className="list-none pl-0 space-y-2 font-bold text-xl mt-4">
                <li>EthoHaiti Email: <a href="mailto:partners@ethohaiti.com" className="text-haitiBlue hover:underline">partners@ethohaiti.com</a></li>
                <li>Website: <a href="https://www.ethohaiti.com/affiliates" className="text-haitiBlue hover:underline">https://www.ethohaiti.com/affiliates</a></li>
              </ul>
            </div>

            {/* ACKNOWLEDGMENT AND ACCEPTANCE */}
            <div className="bg-gray-50 border-2 border-gray-200 p-8 md:p-12 rounded-xl mt-16 text-center shadow-inner">
              <h2 className="text-2xl md:text-3xl font-black text-ethoDark mb-4 uppercase tracking-wider">ACKNOWLEDGMENT AND ACCEPTANCE</h2>
              <p className="text-xl leading-relaxed text-gray-700 m-0">By participating in the affiliate program, you acknowledge that you have read, understood, and agree to be bound by all terms and conditions set forth in this Agreement. Your electronic acceptance through the affiliate application process constitutes your electronic signature.</p>
            </div>
            
          </div>
        </div>
      </div>
    </main>
  );
}