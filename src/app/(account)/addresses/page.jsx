"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddressesPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [customerId, setCustomerId] = useState(null);

  // Address State (We default to US, but you can change it)
  const [shipping, setShipping] = useState({
    first_name: '', last_name: '', address_1: '', address_2: '', city: '', state: '', postcode: '', country: 'US'
  });

  useEffect(() => {
    if (!token) {
      router.push('/account');
      return;
    }

    async function fetchCustomerData() {
      try {
        // Find the WooCommerce Customer ID and Data using their Email via our secure proxy
        const endpoint = encodeURIComponent(`/wp-json/wc/v3/customers?email=${user.email}`);
        const res = await fetch(`/api/woo?endpoint=${endpoint}`);
        const data = await res.json();

        if (data && data.length > 0) {
          const customer = data[0];
          setCustomerId(customer.id);
          // If they already have an address saved in WooCommerce, load it!
          if (customer.shipping) setShipping(customer.shipping);
        }
      } catch (error) {
        console.error("Failed to fetch address:", error);
        setMessage({ type: 'error', text: 'Could not load your address data.' });
      } finally {
        setLoading(false);
      }
    }

    fetchCustomerData();
  }, [token, user, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Update the customer in WooCommerce via our secure proxy
      const res = await fetch('/api/woo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: `/wp-json/wc/v3/customers/${customerId}`,
          // We sync Shipping and Billing to be exactly the same so Printify doesn't throw errors
          data: { 
            shipping: shipping,
            billing: { ...shipping, email: user.email } 
          }
        }),
      });

      const data = await res.json();
      
      if (data.id) {
        setMessage({ type: 'success', text: 'Address successfully updated!' });
      } else {
        throw new Error('Failed to update address.');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving your address.' });
    } finally {
      setSaving(false);
      // Clear success message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-ethoBg flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-haitiBlue mb-4"></div>
        <p className="font-bold text-ethoDark">Loading your address book...</p>
      </div>
    );
  }

  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="text-sm text-gray-500 mb-8 font-medium">
          <Link href="/account" className="hover:text-haitiBlue transition-colors">Your Account</Link>
          <span className="mx-2">›</span>
          <span className="text-ethoDark">Your Addresses</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-ethoDark mb-8">Your Addresses</h1>

        {message.text && (
          <div className={`p-4 mb-6 rounded font-bold text-center ${message.type === 'error' ? 'bg-red-50 text-haitiRed border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-ethoDark">Default Shipping Address</h2>
            <p className="text-sm text-gray-500 mt-1">This address will be automatically used at checkout.</p>
          </div>

          <form onSubmit={handleSaveAddress} className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-ethoDark mb-2">First Name</label>
                <input type="text" name="first_name" value={shipping.first_name} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-ethoDark mb-2">Last Name</label>
                <input type="text" name="last_name" value={shipping.last_name} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ethoDark mb-2">Street Address</label>
              <input type="text" name="address_1" value={shipping.address_1} onChange={handleInputChange} placeholder="123 Main St" className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none mb-3 text-black" required />
              <input type="text" name="address_2" value={shipping.address_2} onChange={handleInputChange} placeholder="Apartment, suite, unit, etc. (optional)" className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-ethoDark mb-2">City</label>
                <input type="text" name="city" value={shipping.city} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-ethoDark mb-2">State / Province</label>
                <input type="text" name="state" value={shipping.state} onChange={handleInputChange} placeholder="FL, NY, etc." className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-ethoDark mb-2">ZIP / Postal Code</label>
                <input type="text" name="postcode" value={shipping.postcode} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-ethoDark mb-2">Country</label>
                <select name="country" value={shipping.country} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none bg-white cursor-pointer text-black" required>
                  <option value="US">United States</option>
                  <option value="HT">Haiti</option>
                  <option value="CA">Canada</option>
                  {/* You can add more countries here later! */}
                </select>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className={`px-8 py-3 rounded font-extrabold text-white shadow-md transition-colors flex items-center gap-2 ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-haitiRed hover:bg-red-700'}`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : 'Save Address'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </main>
  );
}