import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Cookie Policy - EthoHaiti',
  description: 'Learn how EthoHaiti uses cookies and tracking technologies to improve your experience.',
};

export default function CookiesPage() {
  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-ethoDark mb-4">Cookie Policy</h1>
          <p className="text-gray-500 font-medium">Last Updated: April 29, 2026</p>
        </div>

        {/* Content Container */}
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-200">
          <div className="max-w-none text-gray-600">
            
            <p className="mb-10 leading-relaxed">
              This Cookie Policy explains how EthoHaiti ("we", "us", or "our") uses cookies and similar tracking technologies when you visit our website (ethohaiti.com). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>

            <h2 className="text-2xl font-extrabold text-ethoDark mt-12 mb-6">What are cookies?</h2>
            <p className="mb-10 leading-relaxed">
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used by e-commerce stores in order to make their websites work securely, operate more efficiently, and provide reporting information.
            </p>

            <h2 className="text-2xl font-extrabold text-ethoDark mt-12 mb-6">Why do we use cookies?</h2>
            <p className="mb-10 leading-relaxed">
              We use first-party and third-party cookies for several reasons. Some cookies are required for technical and security reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies enable us to track affiliate referrals, process secure payments, and analyze site traffic to enhance the shopping experience.
            </p>

            <h2 className="text-2xl font-extrabold text-ethoDark mt-12 mb-6">The Types of Cookies We Use:</h2>
            <ul className="list-disc pl-6 mb-10 space-y-4 leading-relaxed">
              <li>
                <strong>Strictly Necessary & Security Cookies (PayPal):</strong> These cookies are essential for you to browse the website and use its core features, such as adding items to your cart and accessing secure checkout. We exclusively use PayPal for our payment processing (EthoHaiti does not capture or store your credit card details on our own servers). PayPal sets strictly necessary cookies to securely process your transaction, verify identity, and prevent fraud.
              </li>
              <li>
                <strong>Analytics Cookies (Google Analytics):</strong> We use Google Analytics to help us understand how visitors interact with our storefront. These cookies collect aggregated information—such as the number of visitors to the site, where visitors came from, and the pages they visited—in a way that does not directly identify anyone. This helps us improve our website design and product offerings.
              </li>
              <li>
                <strong>Affiliate Tracking Cookies (GoAffPro):</strong> We run a dedicated partner and creator program. When you visit our site via an affiliate link provided by one of our partners, a tracking cookie is placed in your browser. This is solely used to ensure that if you make a purchase, the referral is accurately tracked so we can pay the affiliate their rightful commission.
              </li>
              <li>
                <strong>Customer Support & Functional Cookies (WhatsApp):</strong> We utilize WhatsApp and email to provide direct customer service. If you interact with a WhatsApp chat widget on our site, functional cookies may be used to launch the application and remember your session state.
              </li>
            </ul>

            <h2 className="text-2xl font-extrabold text-ethoDark mt-12 mb-6">How can I control cookies?</h2>
            <p className="mb-5 leading-relaxed">
              You have the right to decide whether to accept or reject non-essential cookies. You can exercise your cookie preferences by interacting with the consent banner that appears when you first visit our site.
            </p>
            <p className="mb-5 leading-relaxed">
              You can also set or amend your web browser controls to accept or refuse cookies globally. If you choose to reject cookies through your browser, you may still use our website, though your access to some functionality (like the shopping cart or checkout) may be severely restricted or broken.
            </p>
            <p className="mb-10 leading-relaxed">
              To explicitly opt out of being tracked by Google Analytics across all websites, you can install the Google Analytics Opt-out Browser Add-on: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-haitiBlue hover:underline font-bold">https://tools.google.com/dlpage/gaoptout</a>.
            </p>

            <h2 className="text-2xl font-extrabold text-ethoDark mt-12 mb-6">Contact Us</h2>
            <p className="mb-10 leading-relaxed">
              If you have any questions about our use of cookies or other tracking technologies, please contact us at: <a href="mailto:sakpase@ethohaiti.com" className="text-haitiBlue hover:underline font-bold">sakpase@ethohaiti.com</a>.
            </p>

          </div>
        </div>

      </div>
    </main>
  );
}