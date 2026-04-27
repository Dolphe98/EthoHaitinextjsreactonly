"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const supabase = createClient();
  const router = useRouter();

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // Notice: We completely removed the 'redirectTo' URL!
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;
      
      // Push them to the reset page and pass the email in the URL so they don't have to type it again
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      
    } catch (error) {
      setErrorMessage(error.message || "Failed to send reset code.");
      setStatus('error');
    }
  };

  return (
    <main className="pt-32 pb-20 min-h-screen bg-ethoBg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        
        <div className="text-center mb-8">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-haitiBlue"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
          </div>
          <h1 className="text-2xl font-black text-ethoDark">Reset Password</h1>
          <p className="text-sm text-gray-500 mt-2">Enter your email address and we'll send you a 6-digit secure code.</p>
        </div>

        <form onSubmit={handleResetRequest} className="space-y-5">
          {status === 'error' && (
            <div className="bg-red-50 text-haitiRed text-sm font-bold p-3 rounded">{errorMessage}</div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-ethoDark mb-2">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-haitiBlue focus:outline-none text-black"
              placeholder="you@example.com"
            />
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full bg-ethoDark hover:bg-black text-white font-extrabold py-3 px-4 rounded shadow-md transition-colors flex justify-center items-center h-12"
          >
            {status === 'loading' ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : "Send Secure Code"}
          </button>

          <div className="text-center mt-4">
            <Link href="/account" className="text-sm font-bold text-gray-500 hover:text-haitiBlue transition-colors">
              &larr; Back to Login
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}