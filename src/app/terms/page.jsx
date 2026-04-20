import Link from 'next/link';

export const metadata = {
  title: 'Terms and Conditions | EthoHaiti',
  description: 'Terms of service and store policies for EthoHaiti.',
};

export default function TermsPage() {
  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12">
          
          <h1 className="text-4xl font-extrabold text-ethoDark mb-6 border-b-4 border-haitiRed pb-4 inline-block">
            Terms & Conditions
          </h1>
          <p className="text-sm text-gray-500 mb-8 font-bold">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            
            <section>
              <h2 className="text-2xl font-bold text-ethoDark mb-3">1. Agreement to Terms</h2>
              <p>
                By accessing and using EthoHaiti (the "Site"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our website or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-ethoDark mb-3">2. Print-on-Demand Fulfillment</h2>
              <p>
                EthoHaiti operates using a print-on-demand model. This means that every product is custom-printed specifically for you at the time you place your order.
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li><strong>Shipping Times:</strong> Because items are made to order, shipping and processing times may vary. Estimated delivery dates are provided at checkout but are not guaranteed.</li>
                <li><strong>Order Modifications:</strong> Once an order is submitted and sent to our printing partners, it immediately goes into production. Therefore, we cannot guarantee cancellations or modifications once an order is placed.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-ethoDark mb-3">3. Returns & Refunds</h2>
              <p>
                Because all items are custom-printed upon ordering, we do not accept returns or exchanges for buyer's remorse, wrong size selection, or change of mind. 
              </p>
              <p className="mt-2">
                <strong>Defective or Damaged Items:</strong> If you receive a misprinted, damaged, or defective item, you must contact us within 14 days of receiving the product with photographic proof. We will gladly issue a free replacement or a refund for manufacturer errors.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-ethoDark mb-3">4. Intellectual Property</h2>
              <p>
                All designs, logos, text, graphics, and artwork on this website are the exclusive intellectual property of EthoHaiti. You may not reproduce, distribute, or use our designs for commercial purposes without explicit written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-ethoDark mb-3">5. User Accounts</h2>
              <p>
                When you create an account with us, you are responsible for maintaining the security of your password and account details. You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-ethoDark mb-3">6. Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance with standard commercial law, without regard to conflict of law principles.
              </p>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}