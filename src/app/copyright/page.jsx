import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Copyright Policy - EthoHaiti',
  description: 'Intellectual Property and Copyright Policy for EthoHaiti.',
};

export default function CopyrightPage() {
  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-ethoDark mb-4">Intellectual Property & Copyright Policy</h1>
          <p className="text-gray-500 font-medium">Last Updated: April 29, 2026</p>
        </div>

        {/* Content Container */}
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-200">
          <div className="max-w-none text-gray-600">
            
            <h2 className="text-2xl font-extrabold text-ethoDark mt-4 mb-6">1. Ownership of Content and Designs</h2>
            <p className="mb-5 leading-relaxed">
              EthoHaiti ("we", "us", or "our") takes immense pride in the cultural designs, artwork, and messaging provided on our platform. All content on the EthoHaiti website, including but not limited to apparel designs, graphics, text, logos, images, digital downloads, and website code, is the exclusive property of EthoHaiti and is protected by international copyright, trademark, and intellectual property laws.
            </p>
            <p className="mb-10 leading-relaxed">
              EthoHaiti strictly controls and creates 100% of the designs sold on this site. You may not reproduce, duplicate, copy, sell, resell, or exploit any portion of our designs, website content, or products without express written permission from us.
            </p>

            <h2 className="text-2xl font-extrabold text-ethoDark mt-12 mb-6">2. Notification of Copyright Infringement (DMCA)</h2>
            <p className="mb-5 leading-relaxed">
              While EthoHaiti does not allow public users to upload custom designs to our platform, we respect the intellectual property rights of others and expect our partners, affiliates, and contractors to do the same.
            </p>
            <p className="mb-5 leading-relaxed">
              If you are a copyright owner or an agent thereof and believe that any content on the EthoHaiti website infringes upon your copyrights, you may submit a notification pursuant to the Digital Millennium Copyright Act ("DMCA") by providing our Designated Copyright Agent with the following information in writing:
            </p>
            
            <ul className="list-disc pl-6 mb-10 space-y-4 leading-relaxed">
              <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
              <li>Identification of the copyrighted work claimed to have been infringed, or, if multiple copyrighted works on our site are covered by a single notification, a representative list of such works.</li>
              <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit us to locate the material (such as a direct URL).</li>
              <li>Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and, if available, an email address.</li>
              <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
              <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
            </ul>

            <h2 className="text-2xl font-extrabold text-ethoDark mt-12 mb-6">3. Designated Copyright Agent</h2>
            <p className="mb-5 leading-relaxed">
              All DMCA notices and copyright-related inquiries should be sent to our Designated Copyright Agent at the following addresse:
            </p>
            <p className="mb-5 leading-relaxed bg-gray-50 p-4 rounded border border-gray-100 font-medium">
              EthoHaiti Legal Department<br />
              Email: <a href="mailto:legal@ethohaiti.com" className="text-haitiBlue hover:underline font-bold">legal@ethohaiti.com</a>
            </p>
            <p className="mb-10 leading-relaxed">
              Please note that under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material or activity is infringing may be subject to liability for damages. If you are unsure whether material on our site infringes your copyright, we suggest that you contact an attorney first.
            </p>

          </div>
        </div>

      </div>
    </main>
  );
}