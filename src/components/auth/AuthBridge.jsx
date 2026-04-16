"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { createClient } from '@/lib/supabase';

import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'react-phone-number-input';

export default function AuthBridge() {
  const [isLogin, setIsLogin] = useState(true);
  const supabase = createClient();
  
  // Form State
  const [formData, setFormData] = useState({
    email: '', password: '', verifyPassword: '',
    firstName: '', lastName: '', phone: '', whatsapp: ''
  });

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const loginAction = useAuthStore((state) => state.login);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value) => setFormData({ ...formData, phone: value });
  const handleWhatsappChange = (value) => setFormData({ ...formData, whatsapp: value });

  // --- SUPABASE NATIVE GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/account`,
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || "Could not connect to Google. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Pre-Flight Validations for Sign Up
    if (!isLogin) {
      let missing = [];
      if (!formData.firstName) missing.push("First Name");
      if (!formData.lastName) missing.push("Last Name");
      if (!formData.email) missing.push("Email");
      if (!formData.password) missing.push("Password");
      if (!formData.verifyPassword) missing.push("Verify Password");

      if (missing.length > 0) {
        setError(`Missing required fields: ${missing.join(', ')}`);
        setLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address.");
        setLoading(false);
        return;
      }

      const passRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{5,}$/;
      if (!passRegex.test(formData.password)) {
         setError("Password must contain at least 5 characters, 1 uppercase, 1 number, and 1 special character.");
         setLoading(false);
         return;
      }

      if (formData.password !== formData.verifyPassword) {
        setError("Passwords do not match. Please try again.");
        setLoading(false);
        return;
      }

      if (formData.phone && !isValidPhoneNumber(formData.phone)) {
         setError("The Phone number entered is invalid.");
         setLoading(false);
         return;
      }
      if (formData.whatsapp && !isValidPhoneNumber(formData.whatsapp)) {
         setError("The WhatsApp number entered is invalid.");
         setLoading(false);
         return;
      }
    }

    try {
      if (isLogin) {
        // ==========================================
        // SUPABASE SIGN IN FLOW
        // ==========================================
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;

        // Save session to global store
        const userMeta = data.user.user_metadata;
        loginAction(data.session.access_token, { 
          id: data.user.id,
          email: data.user.email, 
          name: `${userMeta.first_name || ''} ${userMeta.last_name || ''}`.trim() 
        });

      } else {
        // ==========================================
        // SUPABASE SIGN UP FLOW
        // ==========================================
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { 
              first_name: formData.firstName, 
              last_name: formData.lastName,
              phone: formData.phone || '',
              whatsapp: formData.whatsapp || ''
            }
          }
        });
        
        if (signUpError) throw signUpError;

        // If user already exists, Supabase returns dummy data without identities
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          throw new Error("An account with this email already exists.");
        }

        // Post-Registration Pivot
        setSuccess("Account created successfully! Please check your email to verify your account, then sign in below.");
        setFormData({ email: '', password: '', verifyPassword: '', firstName: '', lastName: '', phone: '', whatsapp: '' });
        setIsLogin(true);
      }
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  // SVGs for the Eye Toggle
  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );

  const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

  const doPasswordsMatch = formData.verifyPassword && formData.password === formData.verifyPassword;
  const showMatchError = formData.verifyPassword.length > 0 && !doPasswordsMatch;

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
      
      <style dangerouslySetInnerHTML={{__html: `
        .PhoneInput { border: 1px solid #D1D5DB; border-radius: 0.375rem; padding-left: 0.75rem; background-color: #FFFFFF; transition: all 0.2s; }
        .PhoneInput:focus-within { border-color: #00209F; box-shadow: 0 0 0 1px #00209F; }
        .PhoneInputInput { border: none; padding: 0.75rem; outline: none; color: #000000; background-color: transparent; width: 100%; }
        .PhoneInputCountry { margin-right: 0.5rem; }
      `}} />

      <h2 className="text-3xl font-extrabold text-ethoDark text-center mb-8">
        {isLogin ? 'Welcome Back' : 'Join EthoHaiti'}
      </h2>
      
      {/* SUPABASE GOOGLE LOGIN */}
      <div className="flex flex-col items-center">
        <button 
          onClick={handleGoogleLogin}
          type="button" 
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {isLogin ? "Sign in with Google" : "Sign up with Google"}
        </button>
      </div>

      <div className="relative flex py-5 items-center my-3">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-wide">Or continue with email</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {success && <p className="text-green-700 text-sm mb-4 font-bold bg-green-50 p-3 border border-green-200 rounded text-center">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {!isLogin && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-ethoDark mb-1">First Name <span className="text-haitiRed">*</span></label>
                <input name="firstName" value={formData.firstName} placeholder="John" onChange={handleInputChange} className="border border-gray-300 p-3 rounded w-full text-black focus:outline-none focus:ring-1 focus:ring-haitiBlue focus:border-haitiBlue" />
              </div>
              <div>
                <label className="block text-sm font-bold text-ethoDark mb-1">Last Name <span className="text-haitiRed">*</span></label>
                <input name="lastName" value={formData.lastName} placeholder="Doe" onChange={handleInputChange} className="border border-gray-300 p-3 rounded w-full text-black focus:outline-none focus:ring-1 focus:ring-haitiBlue focus:border-haitiBlue" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-ethoDark mb-1">Phone Number <span className="text-gray-400 font-normal">(Optional)</span></label>
              <PhoneInput defaultCountry="US" placeholder="(201) 555-0123" value={formData.phone} onChange={handlePhoneChange} />
            </div>

            <div>
              <label className="block text-sm font-bold text-ethoDark mb-1">WhatsApp <span className="text-gray-400 font-normal">(Optional)</span></label>
              <PhoneInput defaultCountry="US" placeholder="(201) 555-0123" value={formData.whatsapp} onChange={handleWhatsappChange} />
            </div>
          </>
        )}
        
        <div>
          <label className="block text-sm font-bold text-ethoDark mb-1">Email Address <span className="text-haitiRed">*</span></label>
          <input name="email" type="email" value={formData.email} placeholder="you@example.com" onChange={handleInputChange} className="border border-gray-300 p-3 rounded w-full text-black focus:outline-none focus:ring-1 focus:ring-haitiBlue focus:border-haitiBlue" />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-ethoDark mb-1">
            {isLogin ? "Password" : "New Password"} <span className="text-haitiRed">*</span>
          </label>
          <div className="relative">
            <input 
              name="password" 
              type={showPassword ? "text" : "password"} 
              value={formData.password}
              placeholder="••••••••" 
              onChange={handleInputChange} 
              className="border border-gray-300 p-3 rounded w-full text-black focus:outline-none focus:ring-1 focus:ring-haitiBlue focus:border-haitiBlue pr-12" 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-haitiBlue transition-colors">
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>
          
          {!isLogin && (
            <p className="text-xs text-gray-500 font-medium mt-1.5 leading-tight">
              Password must contain at least 5 characters, 1 uppercase letter, 1 digit, and 1 special character.
            </p>
          )}
        </div>

        {!isLogin && (
          <div>
            <label className="block text-sm font-bold text-ethoDark mb-1">Verify Password <span className="text-haitiRed">*</span></label>
            <div className="relative">
              <input 
                name="verifyPassword" 
                type={showVerifyPassword ? "text" : "password"} 
                value={formData.verifyPassword}
                placeholder="••••••••" 
                onChange={handleInputChange} 
                className={`border p-3 rounded w-full text-black focus:outline-none focus:ring-1 pr-12 ${showMatchError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-haitiBlue focus:border-haitiBlue'}`} 
              />
              <button type="button" onClick={() => setShowVerifyPassword(!showVerifyPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-haitiBlue transition-colors">
                {showVerifyPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            {showMatchError && (
              <p className="text-xs text-red-500 font-bold mt-1.5">Passwords do not match</p>
            )}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-haitiRed p-3 border border-red-200 rounded text-center text-sm font-bold mt-4">
            {error}
          </div>
        )}

        <button className="w-full bg-haitiRed text-white p-3.5 rounded font-extrabold hover:bg-red-700 transition shadow-md mt-6 flex justify-center items-center">
          {loading ? (
             <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          ) : isLogin ? "Sign In" : "Create Account"}
        </button>
      </form>

      <div className="flex flex-col items-center">
        <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} className="mt-6 text-sm text-ethoDark font-bold hover:text-haitiBlue transition-colors">
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}