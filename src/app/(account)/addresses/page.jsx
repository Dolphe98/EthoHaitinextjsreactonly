"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase'; 
import { formatPhoneNumber } from '@/utils/formatPhone';

export default function AddressesPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Multi-Address States
  const [addresses, setAddresses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = adding new
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  // Form State - ADDED EMAIL & DELIVERY INSTRUCTIONS
  const [currentForm, setCurrentForm] = useState({
    id: '', fullName: '', email: '', phone: '', address_1: '', address_2: '', city: '', state: '', postcode: '', country: 'US', delivery_instructions: ''
  });
  
  const [baseProfile, setBaseProfile] = useState(null);

  const supabase = createClient();

  // 1. Fetch User Data
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

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setBaseProfile({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            phone: data.phone || data.whatssap || '',
            email: data.email || user.email || ''
          });

          // If they have an address_book JSON array, load it
          if (data.address_book && Array.isArray(data.address_book) && data.address_book.length > 0) {
            setAddresses(data.address_book);
          } 
          // Fallback: If no array, but they have a legacy flat address, convert it to the first array item
          else if (data.address_1) {
            const legacyAddress = {
              id: Date.now().toString(),
              fullName: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
              email: data.email || '',
              phone: data.phone || '',
              address_1: data.address_1,
              address_2: data.address_2 || '',
              city: data.city || '',
              state: data.state || '',
              postcode: data.postcode || '',
              country: data.country || 'US',
              delivery_instructions: ''
            };
            setAddresses([legacyAddress]);
          }
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
    // Intercept the phone input and format it automatically
    const finalValue = name === 'phone' ? formatPhoneNumber(value) : value;
    setCurrentForm((prev) => ({ ...prev, [name]: finalValue }));
  };

  // 2. Save Address (Direct to Supabase, no external API checks)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: 'Saving address to profile...' });

    try {
      // Create new list
      let updatedAddresses = [...addresses];
      const addressToSave = { ...currentForm, id: editingId || Date.now().toString() };

      if (editingId) {
        updatedAddresses = updatedAddresses.map(a => a.id === editingId ? addressToSave : a);
      } else {
        // New addresses go to the TOP (Index 0) to be the new default
        updatedAddresses = [addressToSave, ...updatedAddresses];
      }

      // Save to Supabase (JSON Array AND updating legacy flat fields with the default/latest address)
      const defaultAddress = updatedAddresses[0];

      const { error: supabaseError } = await supabase
        .from('profiles')
        .update({
          address_book: updatedAddresses,
          address_1: defaultAddress.address_1,
          address_2: defaultAddress.address_2,
          city: defaultAddress.city,
          state: defaultAddress.state,
          postcode: defaultAddress.postcode,
          country: defaultAddress.country
        })
        .eq('id', user.id);

      if (supabaseError) throw new Error('Database failed to save the address.');
      
      setAddresses(updatedAddresses);
      setIsEditing(false); 
      setMessage({ type: 'success', text: 'Address successfully saved!' });
      
    } catch (error) {
      console.error("Save Address Error:", error);
      setMessage({ type: 'error', text: error.message || 'An error occurred while saving your address.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  // 3. Delete Interactions
  const triggerDelete = (id) => {
    setAddressToDelete(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    const updatedAddresses = addresses.filter(a => a.id !== addressToDelete);
    setAddresses(updatedAddresses);
    setIsModalOpen(false);
    setAddressToDelete(null);

    // Sync to Supabase
    const defaultAddress = updatedAddresses.length > 0 ? updatedAddresses[0] : null;
    await supabase.from('profiles').upsert({
      id: user.id,
      address_book: updatedAddresses,
      address_1: defaultAddress ? defaultAddress.address_1 : null // nullify flat field if empty
    });
  };

  const openNewForm = () => {
    setCurrentForm({ 
      id: '', 
      fullName: baseProfile ? `${baseProfile.firstName} ${baseProfile.lastName}`.trim() : '', 
      email: baseProfile?.email || '', 
      phone: baseProfile?.phone || '', 
      address_1: '', 
      address_2: '', 
      city: '', 
      state: '', 
      postcode: '', 
      country: 'US', 
      delivery_instructions: '' 
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const openEditForm = (address) => {
    setCurrentForm(address);
    setEditingId(address.id);
    setIsEditing(true);
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
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg relative">

      {/* DELETE CONFIRMATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
            </div>
            <h2 className="text-xl font-bold text-ethoDark mb-2">Delete Address?</h2>
            <p className="text-gray-500 mb-8">Are you sure you want to delete this address? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 rounded font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 px-6 py-3 rounded font-bold text-white bg-haitiRed hover:bg-red-700 transition-colors shadow-md">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <nav className="text-sm text-gray-500 mb-8 font-medium">
          <Link href="/account" className="hover:text-haitiBlue transition-colors">Your Account</Link>
          <span className="mx-2">›</span>
          <span className="text-ethoDark">Your Addresses</span>
        </nav>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-ethoDark">Your Addresses</h1>
          {!isEditing && (
            <button onClick={openNewForm} className="bg-haitiBlue hover:bg-blue-800 text-white font-extrabold py-2 px-6 rounded transition-colors shadow-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add New Address
            </button>
          )}
        </div>

        {message.text && (
          <div className={`p-4 mb-6 rounded font-bold text-center ${message.type === 'error' ? 'bg-red-50 text-haitiRed border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {message.text}
          </div>
        )}

        {isEditing ? (
          /* THE CLEAN, SIMPLE ADD/EDIT FORM */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-ethoDark">{editingId ? 'Edit Address' : 'Add a New Address'}</h2>
            </div>
            
            <form onSubmit={handleSaveAddress} className="p-6 space-y-6 max-w-2xl">
              
              <div>
                <label className="block text-sm font-bold text-ethoDark mb-2">Country / Region</label>
                <select name="country" value={currentForm.country} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none bg-white cursor-pointer text-black font-medium">
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-ethoDark mb-2">Full Name <span className="text-haitiRed">*</span></label>
                <input type="text" name="fullName" value={currentForm.fullName} onChange={handleInputChange} placeholder="First and Last Name" className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black placeholder-gray-400" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-ethoDark mb-1">Email Address <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <p className="text-xs text-gray-500 mb-2">For order updates.</p>
                  <input type="email" name="email" value={currentForm.email} onChange={handleInputChange} placeholder="your@email.com" className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ethoDark mb-1">Phone Number <span className="text-haitiRed">*</span></label>
                  <p className="text-xs text-gray-500 mb-2">To ensure a smooth delivery experience.</p>
                  <input type="tel" name="phone" value={currentForm.phone} onChange={handleInputChange} placeholder="(555) 555-5555" className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black placeholder-gray-400" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-ethoDark mb-2">Address 1 <span className="text-haitiRed">*</span></label>
                <input 
                  type="text" 
                  name="address_1" 
                  value={currentForm.address_1} 
                  onChange={handleInputChange} 
                  placeholder="Street Address or P.O. Box" 
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black placeholder-gray-400" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-ethoDark mb-2">Address 2 <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input 
                  type="text" 
                  name="address_2" 
                  value={currentForm.address_2} 
                  onChange={handleInputChange} 
                  placeholder="Apt, suite, unit, building, floor, etc." 
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black placeholder-gray-400" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-ethoDark mb-2">City <span className="text-haitiRed">*</span></label>
                  <input type="text" name="city" value={currentForm.city} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ethoDark mb-2">State / Province <span className="text-haitiRed">*</span></label>
                  <input type="text" name="state" value={currentForm.state} onChange={handleInputChange} placeholder="FL or NY" className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black uppercase placeholder-gray-400" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-ethoDark mb-2">ZIP / Postal Code <span className="text-haitiRed">*</span></label>
                <input 
                  type="text" 
                  name="postcode" 
                  value={currentForm.postcode} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-ethoDark mb-2">Delivery Instructions <span className="text-gray-400 font-normal">(Optional)</span></label>
                <textarea 
                  name="delivery_instructions" 
                  value={currentForm.delivery_instructions} 
                  onChange={handleInputChange} 
                  maxLength={500}
                  rows={2}
                  placeholder="Gate code, leave at back door, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black placeholder-gray-400 resize-y min-h-[60px]" 
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {(currentForm.delivery_instructions || "").length} / 500
                </div>
              </div>

              <hr className="border-gray-200 mt-6" />

              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 rounded font-extrabold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={`px-8 py-3 rounded font-extrabold text-white shadow-md transition-colors flex items-center gap-2 ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-haitiRed hover:bg-red-700'}`}>
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

        ) : addresses.length > 0 ? (
          
          /* THE CARD LIST VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {addresses.map((addr, index) => (
              <div key={addr.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col relative group hover:shadow-md transition-shadow">
                {index === 0 && (
                  <span className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-xs font-extrabold px-2 py-1 rounded">Default</span>
                )}
                
                <p className="font-extrabold text-lg text-ethoDark mb-2">{addr.fullName}</p>
                <div className="text-gray-600 text-sm space-y-1 mb-6 flex-grow">
                  <p>{addr.address_1}</p>
                  {addr.address_2 && <p>{addr.address_2}</p>}
                  <p>{addr.city}, {addr.state} {addr.postcode}</p>
                  {addr.email && <p className="pt-2">Email: {addr.email}</p>}
                  <p className={!addr.email ? "pt-2" : ""}>Phone: {addr.phone}</p>
                  {addr.delivery_instructions && (
                    <p className="pt-2 text-xs italic bg-gray-50 p-2 rounded mt-2 border border-gray-100">
                      " {addr.delivery_instructions} "
                    </p>
                  )}
                </div>

                <div className="flex gap-4 border-t border-gray-100 pt-4 mt-auto">
                  <button onClick={() => openEditForm(addr)} className="text-haitiBlue hover:underline font-bold text-sm">Edit</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => triggerDelete(addr.id)} className="text-gray-500 hover:text-haitiRed hover:underline font-bold text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>

        ) : (
          
          /* EMPTY STATE */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center justify-center">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-haitiBlue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-ethoDark mb-2">No Addresses Saved</h3>
            <p className="text-gray-500 mb-6 max-w-md">You haven't saved any delivery addresses yet. Add one now to make checkout lightning fast.</p>
            <button onClick={openNewForm} className="bg-haitiBlue hover:bg-blue-800 text-white font-extrabold py-3 px-8 rounded transition-colors shadow-md flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add New Address
            </button>
          </div>

        )}
      </div>
    </main>
  );
}