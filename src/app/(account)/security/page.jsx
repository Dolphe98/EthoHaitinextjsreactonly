"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function SecurityPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  
  // Independent Loading States
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Data States
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState({
    first_name: '', last_name: '', phone: '', whatsapp: ''
  });

  // Password States
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  // Custom Toast Function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    if (!token) {
      router.push('/account');
      return;
    }

    async function fetchUserData() {
      try {
        // 1. Get Auth Data to check provider and email
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setEmail(authUser.email);
          if (authUser.app_metadata?.provider === 'google') {
            setIsGoogleAuth(true);
          }
        }

        // 2. Get Profile Data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone, whatsapp')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile({
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            phone: profileData.phone || '',
            whatsapp: profileData.whatsapp || ''
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        showToast("Failed to load profile data.", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [token, user, router, supabase]);

  // ==========================================
  // CARD 1: SAVE PROFILE
  // ==========================================
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          whatsapp: profile.whatsapp
        })
        .eq('id', user.id);

      if (error) throw error;
      showToast("Personal information updated successfully.");
    } catch (error) {
      showToast(error.message || "Failed to update profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // ==========================================
  // CARD 3: SAVE PASSWORD (STRICT AUTH)
  // ==========================================
  const handleSavePassword = async (e) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      showToast("New passwords do not match.", "error");
      return;
    }
    
    if (getPasswordStrength(passwords.new) < 3) {
      showToast("Please choose a stronger password.", "error");
      return;
    }

    setSavingPassword(true);

    try {
      // STRICT SECURITY CHECK: Attempt to "Login" behind the scenes with the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: passwords.current,
      });

      if (signInError) {
        throw new Error("Your current password is incorrect.");
      }

      // If that succeeded, they are verified. Now update the password.
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (updateError) throw updateError;

      showToast("Password updated successfully.");
      setPasswords({ current: '', new: '', confirm: '' });

    } catch (error) {
      showToast(error.message || "Failed to update password.", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  // Password Strength Logic
  const getPasswordStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s += 1; // Length
    if (/[A-Z]/.test(pw)) s += 1; // Uppercase
    if (/[0-9]/.test(pw)) s += 1; // Number
    if (/[^A-Za-z0-9]/.test(pw)) s += 1; // Special Char
    return s;
  };
  const pwStrength = getPasswordStrength(passwords.new);
  const passwordsMatch = passwords.new === passwords.confirm && passwords.new.length > 0;

  const togglePassword = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
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
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg relative overflow-hidden">
      
      {/* THE CUSTOM TOAST NOTIFICATION */}
      <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className={`px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 ${toast.type === 'error' ? 'bg-haitiRed text-white' : 'bg-ethoDark text-white'}`}>
          {toast.type === 'success' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 text-green-400"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>}
          {toast.type === 'error' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          {toast.message}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500 mb-8 font-medium">
          <Link href="/account" className="hover:text-haitiBlue transition-colors">Your Account</Link>
          <span className="mx-2">›</span>
          <span className="text-ethoDark">Login & Security</span>
        </nav>

        <h1 className="text-3xl font-extrabold text-ethoDark mb-8">Login & Security</h1>

        <div className="space-y-8">
          
          {/* CARD 1: PERSONAL INFORMATION */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-extrabold text-ethoDark">Personal Information</h2>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                  <input type="text" required value={profile.first_name} onChange={(e) => setProfile({...profile, first_name: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                  <input type="text" required value={profile.last_name} onChange={(e) => setProfile({...profile, last_name: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number <span className="text-haitiRed">*</span></label>
                  <input type="tel" required placeholder="For shipping updates" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between">WhatsApp Number <span className="text-xs font-normal text-gray-400">Highly Recommended</span></label>
                  <input type="tel" placeholder="For instant customer support" value={profile.whatsapp} onChange={(e) => setProfile({...profile, whatsapp: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={savingProfile} className="px-6 py-2.5 rounded font-extrabold text-white bg-ethoDark hover:bg-black transition-colors flex items-center gap-2">
                  {savingProfile ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* CARD 2: ACCOUNT EMAIL (LOCKED) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-extrabold text-ethoDark">Account Email</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input type="email" disabled value={email} className="w-full px-4 py-3 border border-gray-200 bg-gray-100 text-gray-500 rounded cursor-not-allowed font-medium" />
              <div className="flex items-start gap-2 mt-3 text-gray-500 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0 text-gray-400"><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" /></svg>
                <p>For security reasons and to ensure your order tracking links remain intact, your email cannot be changed directly. Please contact Support to request an email update.</p>
              </div>
            </div>
          </div>

          {/* CARD 3: CHANGE PASSWORD */}
          {isGoogleAuth ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-8 h-8" />
              <div>
                <h2 className="text-lg font-extrabold text-ethoDark">Google Authentication</h2>
                <p className="text-sm text-gray-500 mt-1">You securely sign in using your Google account. Password changes are managed directly through Google.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-extrabold text-ethoDark">Change Password</h2>
              </div>
              <form onSubmit={handleSavePassword} className="p-6 space-y-6">
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input type={showPassword.current ? "text" : "password"} required value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" />
                    <button type="button" onClick={() => togglePassword('current')} className="absolute right-4 top-3 text-gray-400 hover:text-gray-600">
                      {showPassword.current ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                  <div className="relative mb-2">
                    <input type={showPassword.new ? "text" : "password"} required value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" />
                    <button type="button" onClick={() => togglePassword('new')} className="absolute right-4 top-3 text-gray-400 hover:text-gray-600">
                      {showPassword.new ? "Hide" : "Show"}
                    </button>
                  </div>
                  
                  {/* Password Strength Meter */}
                  <div className="flex gap-1 h-1.5 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level} className={`flex-1 rounded-full ${pwStrength >= level ? (pwStrength < 3 ? 'bg-yellow-400' : 'bg-green-500') : 'bg-gray-200'}`}></div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Requires 8+ characters, 1 uppercase, 1 number, and 1 special character.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input type={showPassword.confirm ? "text" : "password"} required value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} className={`w-full px-4 py-3 border rounded focus:outline-none text-black ${passwords.confirm && !passwordsMatch ? 'border-haitiRed focus:ring-2 focus:ring-haitiRed bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-haitiBlue'}`} />
                    <button type="button" onClick={() => togglePassword('confirm')} className="absolute right-4 top-3 text-gray-400 hover:text-gray-600">
                      {showPassword.confirm ? "Hide" : "Show"}
                    </button>
                  </div>
                  {passwords.confirm && !passwordsMatch && (
                    <p className="text-xs text-haitiRed font-bold mt-2">Passwords do not match.</p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={savingPassword || !passwordsMatch || pwStrength < 3} className="px-6 py-2.5 rounded font-extrabold text-white bg-ethoDark hover:bg-black transition-colors flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed">
                    {savingPassword ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CARD 4: DANGER ZONE */}
          <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
            <div className="p-6 bg-red-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-haitiRed">Delete Account</h2>
                <p className="text-sm text-gray-600 mt-1">Permanently remove your account and data. This action cannot be undone.</p>
              </div>
              <button 
                onClick={() => {
                  if (confirm("Are you absolutely sure? To protect against accidental deletion, please contact Support via WhatsApp to permanently delete your account.")) {
                    router.push('/support');
                  }
                }}
                className="whitespace-nowrap px-6 py-2.5 border-2 border-haitiRed text-haitiRed hover:bg-haitiRed hover:text-white font-extrabold rounded transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}