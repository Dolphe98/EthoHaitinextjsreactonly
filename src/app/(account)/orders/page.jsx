"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SecurityPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [customerId, setCustomerId] = useState(null);

  const [profile, setProfile] = useState({
    first_name: '', last_name: '', email: ''
  });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/account');
      return;
    }

    async function fetchCustomerData() {
      try {
        const endpoint = encodeURIComponent(`/wp-json/wc/v3/customers?email=${user.email}`);
        const res = await fetch(`/api/woo?endpoint=${endpoint}`);
        const data = await res.json();

        if (data && data.length > 0) {
          const customer = data[0];
          setCustomerId(customer.id);
          setProfile({
            first_name: customer.first_name || '',
            last_name: customer.last_name || '',
            email: customer.email || ''
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomerData();
  }, [token, user, router]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const updateData = {
      first_name: profile.first_name,
      last_name: profile.last_name,
    };

    if (newPassword.trim().length > 0) {
      updateData.password = newPassword;
    }

    try {
      const res = await fetch('/api/woo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: `/wp-json/wc/v3/customers/${customerId}`,
          data: updateData
        }),
      });

      const data = await res.json();
      
      if (data.id) {
        setMessage({ type: 'success', text: 'Security settings updated successfully!' });
        setNewPassword(''); // Clear password field
      } else {
        throw new Error('Failed to update profile.');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving your profile.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-ethoBg flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-haitiBlue mb-4"></div>
        <p className="font-bold text-ethoDark">Loading security settings...</p>
      </div>
    );
  }

  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <nav className="text-sm text-gray-500 mb-8 font-medium">
          <Link href="/account" className="hover:text-haitiBlue transition-colors">Your Account</Link>
          <span className="mx-2">›</span>
          <span className="text-ethoDark">Login & Security</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-ethoDark mb-8">Login & Security</h1>

        {message.text && (
          <div className={`p-4 mb-6 rounded font-bold text-center ${message.type === 'error' ? 'bg-red-50 text-haitiRed border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-ethoDark mb-2">First Name</label>
                <input 
                  type="text" 
                  value={profile.first_name} 
                  onChange={(e) => setProfile({...profile, first_name: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-ethoDark mb-2">Last Name</label>
                <input 
                  type="text" 
                  value={profile.last_name} 
                  onChange={(e) => setProfile({...profile, last_name: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ethoDark mb-2">Email Address</label>
              <input 
                type="email" 
                disabled
                value={profile.email} 
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-500 rounded cursor-not-allowed" 
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed directly for security reasons.</p>
            </div>

            <hr className="border-gray-200" />

            <div>
              <label className="block text-sm font-bold text-ethoDark mb-2">New Password (Optional)</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="Leave blank to keep current password"
                className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none mb-2" 
              />
            </div>

            <div className="flex justify-end pt-4">
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
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </main>
  );
}