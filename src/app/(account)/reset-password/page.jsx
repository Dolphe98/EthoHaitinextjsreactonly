"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  
  const [status, setStatus] = useState('idle'); 
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const supabase = createClient();

  // Password Strength Logic
  const getPasswordStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s += 1; 
    if (/[A-Z]/.test(pw)) s += 1; 
    if (/[0-9]/.test(pw)) s += 1; 
    if (/[^A-Za-z0-9]/.test(pw)) s += 1; 
    return s;
  };
  const pwStrength = getPasswordStrength(passwords.new);
  const passwordsMatch = passwords.new === passwords.confirm && passwords.new.length > 0;

  const handleVerifyAndUpdate = async (e) => {
    e.preventDefault();
    if (!passwordsMatch || pwStrength < 3 || code.length !== 6 || !email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      // Step 1: Verify the 6-digit code
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'recovery'
      });

      if (verifyError) throw verifyError;

      // Step 2: If the code is correct, instantly update the password
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: passwords.new 
      });

      if (updateError) throw updateError;
      
      setStatus('success');
      setTimeout(() => {
        router.push('/account'); 
      }, 3000);

    } catch (error) {
      setErrorMessage(error.message || "Invalid code or expired request.");
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <main className="pt-32 pb-20 min-h-screen bg-ethoBg flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-green-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
          </div>
          <h2 className="text-2xl font-black text-ethoDark mb-2">Password Updated!</h2>
          <p className="text-gray-500 mb-4">Your password has been securely changed.</p>
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-green-600 mx-auto"></div>
          <p className="text-xs text-gray-400 mt-3">Redirecting to your account...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-ethoDark">Create New Password</h1>
          <p className="text-sm text-gray-500 mt-2">Enter the 6-digit code from your email and your new password below.</p>
        </div>

        <form onSubmit={handleVerifyAndUpdate} className="space-y-6">
          {status === 'error' && (
            <div className="bg-red-50 text-haitiRed text-sm font-bold p-3 rounded">{errorMessage}</div>
          )}

          {!emailParam && (
            <div>
              <label className="block text-sm font-bold text-ethoDark mb-2">Email Address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" 
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-ethoDark mb-2">6-Digit Secure Code</label>
            <input 
              type="text" 
              maxLength={6}
              required 
              value={code} 
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // Forces numbers only
              className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black tracking-[0.5em] font-black text-center text-xl" 
              placeholder="000000"
            />
          </div>

          <div className="border-t border-gray-100 pt-6">
            <label className="block text-sm font-bold text-ethoDark mb-2">New Password</label>
            <div className="relative mb-2">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={passwords.new} 
                onChange={(e) => setPasswords({...passwords, new: e.target.value})} 
                className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black" 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 font-bold text-sm">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            
            <div className="flex gap-1 h-1.5 mb-1">
              {[1, 2, 3, 4].map((level) => (
                <div key={level} className={`flex-1 rounded-full ${pwStrength >= level ? (pwStrength < 3 ? 'bg-yellow-400' : 'bg-green-500') : 'bg-gray-200'}`}></div>
              ))}
            </div>
            <p className="text-xs text-gray-500">Requires 8+ characters, 1 uppercase, 1 number, 1 special character.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-ethoDark mb-2">Confirm New Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              value={passwords.confirm} 
              onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} 
              className={`w-full px-4 py-3 border rounded focus:outline-none text-black ${passwords.confirm && !passwordsMatch ? 'border-haitiRed focus:ring-2 focus:ring-haitiRed bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-haitiBlue'}`} 
            />
            {passwords.confirm && !passwordsMatch && (
              <p className="text-xs text-haitiRed font-bold mt-2">Passwords do not match.</p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading' || !passwordsMatch || pwStrength < 3 || code.length !== 6 || !email}
            className="w-full bg-haitiRed hover:bg-red-700 text-white font-extrabold py-3 px-4 rounded shadow-md transition-colors flex justify-center items-center h-12 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : "Reset Password"}
          </button>
        </form>
      </div>
    </main>
  );
}