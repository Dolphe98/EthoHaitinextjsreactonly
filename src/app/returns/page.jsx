import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Returns & Cancellations Policy - EthoHaiti',
  description: 'Returns, exchanges, and cancellations policy for EthoHaiti.',
};

export default function ReturnsPage() {
  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-ethoDark mb-4">Returns & Cancellations Policy</h1>
          <p className="text-gray-500 font-medium">Please review our policies regarding your custom orders.</p>
        </div>

        {/* Content Container */}
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-200">
          <div className="max-w-none text-gray-600">
            
            <h2 className="text-2xl font-extrabold text-ethoDark mt-4 mb-6"><strong>Cancellations</strong></h2>
            <p className="mb-5 leading-relaxed">
              Because our items are custom-printed specifically for you, orders enter the production pipeline very quickly. You have a strict 6-hour window from the time you place your order to request a cancellation or make changes (such as updating an address or changing a size).
            </p>
            <p className="mb-10 leading-relaxed">
              After 6 hours, the order is sent to our printing facilities, and we can no longer cancel or modify it. To request a cancellation within the 6-hour window, do it through the website or email us immediately at <a href="mailto:sakpase@ethohaiti.com" className="text-haitiBlue hover:underline font-bold">sakpase@ethohaiti.com</a>.
            </p>

            <h2 className="text-2xl font-extrabold text-ethoDark mt-12 mb-6"><strong>Returns & Exchanges</strong></h2>
            <p className="mb-10 leading-relaxed">
              All EthoHaiti products are unique and produced per order. Because Print-on-Demand fulfillment is custom, we do not hold inventory. Therefore, we do not offer returns or exchanges if you order the wrong size, color, or simply change your mind. Please refer carefully to the sizing charts provided on every product page before completing your purchase to ensure the correct fit.
            </p>

            <h2 className="text-2xl font-extrabold text-ethoDark mt-12 mb-6"><strong>Damages and Misprints</strong></h2>
            <p className="mb-5 leading-relaxed">
              We stand behind the quality of our products. If you receive an item that is defective, damaged, or features a manufacturing error (such as a misprint), we will gladly offer a free replacement.
            </p>
            <p className="mb-5 leading-relaxed font-bold text-ethoDark">
              You must contact us within 7 days of receiving your delivery to report an issue.
            </p>
            <p className="mb-3 leading-relaxed">
              To resolve the issue quickly, please follow these steps:
            </p>
            <ul className="list-disc pl-6 mb-5 space-y-2 leading-relaxed">
              <li>Email us at <a href="mailto:sakpase@ethohaiti.com" className="text-haitiBlue hover:underline font-bold">sakpase@ethohaiti.com</a> within 7 days of delivery.</li>
              <li>Include your order number.</li>
              <li>Attach a clear photograph showing the damaged or defective area of the product.</li>
            </ul>
            <p className="mb-10 leading-relaxed">
              In most cases, you will not need to ship the defective item back to us. Once we receive the photo and verify the defect with our printing partners, we will automatically issue a replacement to your original shipping address at no extra cost.
            </p>

            <h2 className="text-2xl font-extrabold text-ethoDark mt-12 mb-6"><strong>Refunds</strong></h2>
            <p className="mb-5 leading-relaxed">
              If you opt for a refund on a defective item rather than a replacement, we will notify you once your claim is approved. You will be automatically refunded on your original payment method within 10 business days. Please remember it can take some time for your bank or credit card company to process and post the refund.
            </p>
            <p className="mb-5 leading-relaxed">
              If more than 15 business days have passed since we approved your refund, please contact us at <a href="mailto:sakpase@ethohaiti.com" className="text-haitiBlue hover:underline font-bold">sakpase@ethohaiti.com</a>.
            </p>

          </div>
        </div>

      </div>
    </main>
  );
}