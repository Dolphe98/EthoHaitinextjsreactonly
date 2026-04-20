"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase'; 

export default function AddressesPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // NEW: UI Toggle States
  const [isEditing, setIsEditing] = useState(false);
  const [hasAddress, setHasAddress] = useState(false);
  
  // Initialize Supabase
  const supabase = createClient();

  // Address State
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
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        // If they have data AND an actual street address saved
        if (data && data.address_1) {
          setShipping({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            address_1: data.address_1 || '',
            address_2: data.address_2 || '',
            city: data.city || '',
            state: data.state || '',
            postcode: data.postcode || '',
            country: data.country || 'US'
          });
          setHasAddress(true); // Tell the UI they have an address
        } else {
          setHasAddress(false);
        }
      } catch (error) {
        console.error("Failed to fetch address:", error);
        setMessage({ type: 'error', text: 'Could not load your address data.' });
      } finally {
        setLoading(false);
      }
    }

    fetchCustomerData();
  }, [token, user, router, supabase]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id, 
          first_name: shipping.first_name,
          last_name: shipping.last_name,
          address_1: shipping.address_1,
          address_2: shipping.address_2,
          city: shipping.city,
          state: shipping.state,
          postcode: shipping.postcode,
          country: shipping.country
        }, { onConflict: 'id' });

      if (error) throw error;
      
      setHasAddress(true); // Ensure UI knows they now have an address
      setIsEditing(false); // Auto-close the form
      setMessage({ type: 'success', text: 'Address successfully updated!' });
      
    } catch (error) {
      console.error("Save Address Error:", error);
      setMessage({ type: 'error', text: 'An error occurred while saving your address.' });
    } finally {
      setSaving(false);
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
          
          {/* HEADER SECTION WITH EDIT BUTTON */}
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-ethoDark">Default Shipping Address</h2>
              <p className="text-sm text-gray-500 mt-1">This address will be automatically used at checkout.</p>
            </div>
            {!isEditing && hasAddress && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="flex items-center gap-2 text-haitiBlue hover:text-blue-800 font-bold px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors shadow-sm"
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {/* DYNAMIC CONTENT AREA */}
          {isEditing ? (
            
            /* VIEW 1: THE FORM */
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
                  </select>
                </div>
              </div>

              <hr className="border-gray-200" />

              <div className="flex justify-end gap-4">
                {/* CANCEL BUTTON */}
                {hasAddress && (
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 rounded font-extrabold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                
                {/* SAVE BUTTON */}
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

          ) : hasAddress ? (

            /* VIEW 2: THE READ-ONLY SUMMARY */
            <div className="p-8">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-inner">
                <p className="font-extrabold text-xl text-ethoDark mb-3">{shipping.first_name} {shipping.last_name}</p>
                <div className="text-gray-700 space-y-1 text-lg">
                  <p>{shipping.address_1}</p>
                  {shipping.address_2 && <p>{shipping.address_2}</p>}
                  <p>{shipping.city}, {shipping.state} {shipping.postcode}</p>
                  <p className="font-medium mt-2 text-gray-500 uppercase tracking-wide">
                    {shipping.country === 'US' ? 'United States' : shipping.country === 'HT' ? 'Haiti' : 'Canada'}
                  </p>
                </div>
              </div>
            </div>

          ) : (

            /* VIEW 3: THE EMPTY STATE */
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="bg-blue-50 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-haitiBlue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-ethoDark mb-2">No Address Saved</h3>
              <p className="text-gray-500 mb-6 max-w-md">You haven't saved a default delivery address yet. Add one now to make checkout lightning fast.</p>
              <button 
                onClick={() => setIsEditing(true)} 
                className="bg-haitiBlue hover:bg-blue-800 text-white font-extrabold py-3 px-8 rounded transition-colors shadow-md flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add New Address
              </button>
            </div>

          )}
        </div>

      </div>
    </main>
  );
}