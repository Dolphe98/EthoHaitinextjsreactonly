import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | EthoHaiti',
  description: 'How we collect, use, and protect your data at EthoHaiti.',
};

export default function PrivacyPage() {
  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12">
          
          <h1 className="text-4xl font-extrabold text-ethoDark mb-6 border-b-4 border-haitiRed pb-4 inline-block">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 mb-8 font-bold">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            
            <section>
              <h2 className="text-2xl font-bold text-ethoDark mb-3">1. Introduction</h2>
              <p>
                Welcome to EthoHaiti ("we", "our", or "us"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website (ethohaiti.com) and purchase our products.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-ethoDark mb-3">2. Information We Collect</h2>
              <p>We collect information necessary to fulfill your orders and improve your experience:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li><strong>Identity Data:</strong> First name, last name, and account credentials (managed securely via Supabase and Google OAuth).</li>
                <li><strong>Contact Data:</strong> Email address and phone number.</li>
                <li><strong>Shipping Data:</strong> Delivery addresses for order fulfillment.</li>
                <li><strong>Transaction Data:</strong> Details about payments. <em>Note: We do not store your credit card details. All payments are securely processed by PayPal.</em></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-ethoDark mb-3">3. How We Use Your Data</h2>
              <p>We use your data primarily to provide our services:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>To process and fulfill your orders via our print-on-demand partner (Printify).</li>
                <li>To manage your account and authentication securely.</li>
                <li>To communicate with you regarding your orders, shipping updates, or customer support.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-ethoDark mb-3">4. Third-Party Services</h2>
              <p>We share necessary data with trusted third parties solely for operating our business:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li><strong>Printify:</strong> We share your shipping address and order details to print and deliver your apparel.</li>
                <li><strong>PayPal:</strong> Handles all secure payment processing.</li>
                <li><strong>Supabase:</strong> Manages our secure database and user authentication.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-ethoDark mb-3">5. Cookies & Local Storage</h2>
              <p>
                We use strictly necessary browser local storage to maintain your shopping cart, user session, and website preferences. We do not use invasive tracking cookies for unauthorized third-party advertising.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-ethoDark mb-3">6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or how your data is handled, please contact us at: <br/>
                <strong>Email:</strong> support@ethohaiti.com
              </p>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}