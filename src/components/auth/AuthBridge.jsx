"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'; 
import { jwtDecode } from "jwt-decode"; 

import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'react-phone-number-input';

export default function AuthBridge() {
  const [isLogin, setIsLogin] = useState(true);
  
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

  // Standard text inputs
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Specific handlers for the Phone Library
  const handlePhoneChange = (value) => setFormData({ ...formData, phone: value });
  const handleWhatsappChange = (value) => setFormData({ ...formData, whatsapp: value });

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const googleEmail = decoded.email;
      
      const checkRes = await fetch(`/api/woo?endpoint=${encodeURIComponent(`/wp-json/wc/v3/customers?email=${googleEmail}`)}`);
      const existing = await checkRes.json();

      if (existing.length === 0) {
        await fetch('/api/woo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: '/wp-json/wc/v3/customers',
            data: { 
              email: googleEmail,
              first_name: decoded.given_name,
              last_name: decoded.family_name,
              username: googleEmail.split('@')[0],
              password: Math.random().toString(36).slice(-10) + "Google!",
              meta_data: [{ key: 'is_verified', value: 'yes' }] 
            }
          }),
        });
      }
      
      loginAction(credentialResponse.credential, { email: googleEmail, name: decoded.name, verified: true });
    } catch (err) {
      setError("Could not sync Google account with EthoHaiti. Please try again.");
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Pre-Flight Validations for Sign Up
    if (!isLogin) {
      // 1. Missing Fields Master Error
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

      // 2. Strict Email Regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address.");
        setLoading(false);
        return;
      }

      // 3. Strict Password Regex (1 Upper, 1 Number, 1 Special, Min 5 chars)
      const passRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{5,}$/;
      if (!passRegex.test(formData.password)) {
         setError("Password does not meet the security requirements.");
         setLoading(false);
         return;
      }

      // 4. Passwords Match
      if (formData.password !== formData.verifyPassword) {
        setError("Passwords do not match. Please try again.");
        setLoading(false);
        return;
      }

      // 5. Strict Phone Library Validation
      if (formData.phone && !isValidPhoneNumber(formData.phone)) {
         setError("The Phone number entered is invalid for the selected country.");
         setLoading(false);
         return;
      }
      if (formData.whatsapp && !isValidPhoneNumber(formData.whatsapp)) {
         setError("The WhatsApp number entered is invalid for the selected country.");
         setLoading(false);
         return;
      }
    }

    try {
      if (isLogin) {
        // --- SIGN IN FLOW ---
        const res = await fetch('https://backend.ethohaiti.com/wp-json/jwt-auth/v1/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.email, password: formData.password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message?.replace(/<[^>]+>/g, '') || 'Login failed. Check your credentials.');
        loginAction(data.token, { email: data.user_email, name: data.user_display_name });
      } else {
        // --- SIGN UP FLOW ---
        const res = await fetch('/api/woo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: '/wp-json/wc/v3/customers',
            data: { 
              email: formData.email, password: formData.password,
              first_name: formData.firstName, last_name: formData.lastName,
              billing: { phone: formData.phone || '' },
              meta_data: [
                { key: 'whatsapp_number', value: formData.whatsapp || '' }, 
                { key: 'verify_deadline', value: Date.now() + 86400000 }
              ]
            }
          }),
        });
        const data = await res.json();
        
        if (data.id) {
          // ==========================================
          // PHASE 3: THE POST-REGISTRATION PIVOT
          // ==========================================
          
          // 1. Display the exact green success message you requested
          setSuccess("Account created successfully! Please verify your email, then sign in below.");
          
          // 2. Instantly clear all form data to wipe the slate clean
          setFormData({ email: '', password: '', verifyPassword: '', firstName: '', lastName: '', phone: '', whatsapp: '' });
          
          // 3. Automatically flip the UI tab back to "Sign In"
          setIsLogin(true);

        } else { 
          throw new Error(data.message || "Registration failed."); 
        }
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

  // Dynamic Password Validation Check for UI
  const doPasswordsMatch = formData.verifyPassword && formData.password === formData.verifyPassword;
  const showMatchError = formData.verifyPassword.length > 0 && !doPasswordsMatch;

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
        
        {/* Custom CSS overrides to make the library match EthoHaiti styling */}
        <style dangerouslySetInnerHTML={{__html: `
          .PhoneInput {
            border: 1px solid #D1D5DB;
            border-radius: 0.375rem;
            padding-left: 0.75rem;
            background-color: #FFFFFF;
            transition: all 0.2s;
          }
          .PhoneInput:focus-within {
            border-color: #00209F;
            box-shadow: 0 0 0 1px #00209F;
          }
          .PhoneInputInput {
            border: none;
            padding: 0.75rem;
            outline: none;
            color: #000000;
            background-color: transparent;
            width: 100%;
          }
          .PhoneInputCountry {
            margin-right: 0.5rem;
          }
        `}} />

        <h2 className="text-3xl font-extrabold text-ethoDark text-center mb-8">
          {isLogin ? 'Welcome Back' : 'Join EthoHaiti'}
        </h2>
        
        {/* GOOGLE LOGIN AT TOP */}
        <div className="flex flex-col items-center">
          <GoogleLogin onSuccess={handleGoogleSuccess} text={isLogin ? "signin_with" : "signup_with"} shape="pill" size="large" />
        </div>

        <div className="relative flex py-5 items-center my-3">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-wide">Or continue with email</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {success && <p className="text-green-700 text-sm mb-4 font-bold bg-green-50 p-3 border border-green-200 rounded text-center">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* SIGN UP FIELDS */}
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
              
              {/* Phone Input from Library */}
              <div>
                <label className="block text-sm font-bold text-ethoDark mb-1">Phone Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                <PhoneInput
                  defaultCountry="US"
                  placeholder="(201) 555-0123"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                />
              </div>

              {/* WhatsApp Input from Library */}
              <div>
                <label className="block text-sm font-bold text-ethoDark mb-1">WhatsApp <span className="text-gray-400 font-normal">(Optional)</span></label>
                <PhoneInput
                  defaultCountry="US"
                  placeholder="(201) 555-0123"
                  value={formData.whatsapp}
                  onChange={handleWhatsappChange}
                />
              </div>
            </>
          )}
          
          {/* ALWAYS SHOW EMAIL */}
          <div>
            <label className="block text-sm font-bold text-ethoDark mb-1">Email Address <span className="text-haitiRed">*</span></label>
            <input name="email" type="email" value={formData.email} placeholder="you@example.com" onChange={handleInputChange} className="border border-gray-300 p-3 rounded w-full text-black focus:outline-none focus:ring-1 focus:ring-haitiBlue focus:border-haitiBlue" />
          </div>
          
          {/* Password with Visibility Toggle */}
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
            
            {/* Password Rule Note (Only on Sign Up) */}
            {!isLogin && (
              <p className="text-xs text-gray-500 font-medium mt-1.5 leading-tight">
                Password must contain at least 5 characters, 1 uppercase letter, 1 digit, and 1 special character.
              </p>
            )}
          </div>

          {/* Verify Password with Real-Time Match Checking */}
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
          
          {/* Dynamic Error Message Block right above the submit button */}
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
    </GoogleOAuthProvider>
  );
}