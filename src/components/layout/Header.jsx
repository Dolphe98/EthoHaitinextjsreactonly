"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore'; 

export default function Header() {
  const cart = useCartStore((state) => state.cart);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Bring in the new Phase 4 properties: lastActivity and updateActivity
  const { token, user, logout, lastActivity, updateActivity } = useAuthStore();
  const isLoggedIn = !!token;

  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // =====================================================
  // PHASE 4: 24-HOUR INACTIVITY AUTO-LOGOUT GUARD
  // =====================================================
  useEffect(() => {
    // Only run the security guard if the user is actually logged in
    if (!token) return;

    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // 1. The Clock Checker (Wakes up every 1 minute to check the time)
    const checkSession = setInterval(() => {
      if (lastActivity && (Date.now() - lastActivity > TWENTY_FOUR_HOURS)) {
        logout();
        alert("Your session has expired due to 24 hours of inactivity. Please log in again.");
      }
    }, 60000); 

    // 2. The Activity Listener (Updates clock on click/scroll/type)
    let throttleTimer;
    const handleActivity = () => {
       if (throttleTimer) return;
       // Throttle to max 1 update every 5 seconds so we don't lag the site performance
       throttleTimer = setTimeout(() => {
         updateActivity();
         throttleTimer = null;
       }, 5000); 
    };

    // Attach listeners to the browser window
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('click', handleActivity);

    // Clean up listeners if the user leaves the page or logs out
    return () => {
      clearInterval(checkSession);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('click', handleActivity);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [token, lastActivity, logout, updateActivity]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navCategories, setNavCategories] = useState([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  useEffect(() => {
    fetch("https://backend.ethohaiti.com/wp-json/wc/store/v1/products/categories?per_page=100")
      .then(res => res.json())
      .then(data => {
        const cleanName = (name) => name.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&");

        const parents = data.filter(cat => cat.parent === 0 && cat.count > 0);
        const subcategories = data.filter(cat => cat.parent !== 0 && cat.count > 0);
        
        const hierarchy = parents.map(parent => ({
            ...parent,
            name: cleanName(parent.name),
            children: subcategories.filter(sub => sub.parent === parent.id).map(sub => ({
              ...sub,
              name: cleanName(sub.name)
            }))
        }));
        
        setNavCategories(hierarchy);
      })
      .catch(err => console.error("Error fetching header categories:", err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        desktopSearchRef.current && !desktopSearchRef.current.contains(event.target) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)
      ) {
        setIsSearchDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      setIsSearchDropdownOpen(false);
    };

    if (isSearchDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isSearchDropdownOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const lowerQuery = searchQuery.trim().toLowerCase();
    let matchedCategorySlug = null;

    navCategories.forEach(parent => {
      if (parent.name.toLowerCase() === lowerQuery) matchedCategorySlug = parent.slug;
      parent.children.forEach(sub => {
        if (sub.name.toLowerCase() === lowerQuery) matchedCategorySlug = sub.slug;
      });
    });

    if (matchedCategorySlug) {
      router.push(`/category/${matchedCategorySlug}`); 
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
    
    setSearchQuery("");
    setIsSearchDropdownOpen(false);
    setIsMenuOpen(false);
  };

  let userLastName = "Shopper";
  if (user?.name) {
    const nameParts = user.name.trim().split(' ');
    userLastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
  } else if (user?.email) {
    userLastName = user.email.split('@')[0];
  }

  if (userLastName.length > 7) {
    userLastName = userLastName.substring(0, 7) + '...';
  }

  return (
    <>
      {/* OVERLAY FOR MAIN MENU */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] transition-opacity" onClick={() => setIsMenuOpen(false)}></div>
      )}

      {/* MOBILE SLIDE-OUT MAIN MENU */}
      <div className={`fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white z-[110] transform transition-transform duration-300 ease-in-out flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="bg-gradient-to-r from-ethoDark to-haitiBlue text-white p-4 flex justify-between items-center border-b-[3px] border-haitiRed">
          <div className="flex items-center gap-2 font-bold text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" /></svg>
            {isMounted && isLoggedIn ? `Hello, ${userLastName}` : "Sign In"}
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="text-white hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 font-black text-xl text-ethoDark hover:text-haitiBlue transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7 text-haitiRed">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Home EthoHaiti
            </Link>
          </div>

          <div className="p-4">
            <h3 className="font-extrabold text-xl mb-2 text-ethoDark">Trending</h3>
            <ul className="space-y-4 text-gray-700">
              <li className="cursor-pointer hover:text-haitiBlue hover:font-bold">Best Sellers</li>
              <li className="cursor-pointer hover:text-haitiBlue hover:font-bold">New Arrivals</li>
            </ul>
          </div>
          <hr className="border-gray-200" />
          
          <div className="p-4">
            <h3 className="font-extrabold text-xl mb-2 text-ethoDark">Shop by Category</h3>
            <ul className="space-y-4 text-gray-700">
              {navCategories.map(parent => (
                <div key={parent.id} className="mb-2">
                  <Link href={`/category/${parent.slug}`} onClick={() => setIsMenuOpen(false)} className="font-bold text-haitiBlue text-base block mb-2 cursor-pointer hover:underline">
                    {parent.name}
                  </Link>
                  <ul className="pl-4 space-y-2 border-l-2 border-gray-100">
                    {parent.children.map(sub => (
                      <li key={sub.id}>
                        <Link href={`/category/${sub.slug}`} onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:text-haitiRed block cursor-pointer transition-colors text-sm">
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </ul>
          </div>
          <hr className="border-gray-200" />
          <div className="p-4">
             <h3 className="font-extrabold text-xl mb-2 text-ethoDark">Settings</h3>
             <ul className="space-y-4 text-gray-700">
               <Link href="/account" onClick={() => setIsMenuOpen(false)}>
                 <li className="cursor-pointer hover:text-haitiBlue hover:font-bold py-2">Your Account</li>
               </Link>
               {(!isMounted || !isLoggedIn) && (
                 <Link href="/account" onClick={() => setIsMenuOpen(false)}>
                   <li className="cursor-pointer hover:text-haitiBlue hover:font-bold py-2">Sign In</li>
                 </Link>
               )}
             </ul>
          </div>
        </div>
      </div>

      {/* ==========================================
          DESKTOP HEADER
          ========================================== */}
      <nav className="hidden md:flex flex-col w-full relative z-50">
        <div className="bg-gradient-to-r from-ethoDark via-slate-800 to-haitiBlue text-white px-4 py-2 flex items-center justify-between gap-4 border-b-[3px] border-haitiRed">
          <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <div className="relative flex items-center justify-center p-2">
              <div className="absolute inset-0 bg-white opacity-80 rounded-[40%] blur-md"></div>
              <img src="/logoethohaiticom1.png" alt="EthoHaiti Logo" className="h-20 w-auto object-contain relative z-10" />
            </div>
          </Link>

          <div className="group relative flex items-center p-1 border border-transparent hover:border-white cursor-pointer rounded">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mt-3 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-gray-300">Deliver to...</span>
              <span className="text-sm font-bold">Haiti / USA</span>
            </div>
          </div>

          <form ref={desktopSearchRef} onSubmit={handleSearch} className="flex-grow flex relative max-w-3xl">
            <div className="flex w-full rounded-md overflow-hidden bg-white">
              <button type="button" onClick={() => setIsSearchDropdownOpen(!isSearchDropdownOpen)} className="bg-gray-100 text-gray-700 text-sm px-3 py-3 border-r border-gray-300 flex items-center gap-1 hover:bg-gray-200 focus:outline-none">
                All <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
              </button>
              
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search EthoHaiti..." className="flex-grow px-4 py-2 text-black focus:outline-none" />
              
              <button type="submit" className="bg-haitiRed hover:bg-red-700 text-white px-5 py-3 transition-colors h-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
              </button>
            </div>

            {isSearchDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 shadow-2xl z-[120] max-h-80 overflow-y-auto rounded text-black flex flex-col">
                {navCategories.map(parent => (
                  <div key={parent.id} className="border-b border-gray-100 last:border-0">
                    <Link href={`/category/${parent.slug}`} onClick={() => setIsSearchDropdownOpen(false)} className="block px-4 py-2 bg-gray-50 font-bold text-ethoDark hover:text-haitiBlue hover:bg-gray-100 transition-colors">{parent.name}</Link>
                    {parent.children.map(sub => (
                      <Link key={sub.id} href={`/category/${sub.slug}`} onClick={() => setIsSearchDropdownOpen(false)} className="block px-8 py-2 text-sm text-gray-600 hover:text-haitiRed hover:bg-gray-50 transition-colors">{sub.name}</Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </form>

          <Link href="/account" className="flex flex-col leading-tight p-1 border border-transparent hover:border-white cursor-pointer rounded text-white text-left ml-4">
            {isMounted && isLoggedIn ? (
              <>
                <span className="text-xs font-normal">Hello, {userLastName}</span>
                <span className="text-sm font-bold">Account</span>
              </>
            ) : (
              <>
                <span className="text-xs font-normal">Hello</span>
                <span className="text-sm font-bold">Sign in / Sign up</span>
              </>
            )}
          </Link>

          <Link href="/cart" className="flex items-center gap-1 p-1 border border-transparent hover:border-white rounded cursor-pointer text-white ml-2">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-9 h-9">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              <span className="absolute -top-1 right-0 text-haitiRed font-bold text-lg w-full text-center">
                {isMounted ? totalItems : 0}
              </span>
            </div>
            <span className="font-bold text-sm mt-3">Cart</span>
          </Link>
        </div>

        <div className="bg-ethoDark text-white text-sm px-4 py-2 flex items-center gap-6 overflow-x-auto shadow-sm whitespace-nowrap no-scrollbar">
          <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-1 font-bold hover:border-white border border-transparent p-1 rounded transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            All
          </button>
          {navCategories.map(parent => (
            <Link key={parent.id} href={`/category/${parent.slug}`} className="cursor-pointer border border-transparent hover:border-white p-1 rounded transition-colors font-medium">{parent.name}</Link>
          ))}
        </div>
      </nav>

      {/* ==========================================
          MOBILE HEADER
          ========================================== */}
      <nav className="md:hidden flex flex-col w-full bg-gradient-to-r from-ethoDark to-haitiBlue text-white border-b-[3px] border-haitiRed relative z-50 shadow-md">
        
        {/* Top Row: Main Menu, Logo, User, Cart */}
        <div className="px-3 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMenuOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
            <Link href="/" className="flex-shrink-0">
               <div className="relative flex items-center justify-center p-1">
                <div className="absolute inset-0 bg-white opacity-80 rounded-[40%] blur-sm"></div>
                <img src="/logoethohaiticom1.png" alt="EthoHaiti Logo" className="h-10 w-auto object-contain relative z-10" />
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/account" className="flex flex-col text-white text-left leading-tight">
               {isMounted && isLoggedIn ? (
                <>
                  <span className="text-xs font-normal">Hello, {userLastName}</span>
                  <span className="text-sm font-bold">Account</span>
                </>
              ) : (
                <>
                  <span className="text-xs font-normal">Hello</span>
                  <span className="text-sm font-bold">Sign in / Sign up</span>
                </>
              )}
            </Link>

            <Link href="/cart" className="relative text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>
              <span className="absolute -top-1 right-0 text-haitiRed font-bold text-sm w-full text-center">
                {isMounted ? totalItems : 0}
              </span>
            </Link>
          </div>
        </div>

        <form ref={mobileSearchRef} onSubmit={handleSearch} className="px-3 pb-3 relative">
          <div className="flex items-center rounded overflow-hidden bg-white shadow-inner">
            <button type="button" onClick={() => setIsSearchDropdownOpen(!isSearchDropdownOpen)} className="bg-gray-100 text-gray-700 text-sm px-3 py-3 border-r border-gray-300 flex items-center gap-1 hover:bg-gray-200 focus:outline-none">
              All <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
            </button>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search EthoHaiti..." className="flex-grow px-3 py-2 text-black focus:outline-none" />
            <button type="submit" className="bg-haitiRed text-white px-4 py-2 hover:bg-red-700 transition-colors h-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            </button>
          </div>

          {isSearchDropdownOpen && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-white border border-gray-300 shadow-2xl z-[120] max-h-80 overflow-y-auto rounded text-black flex flex-col">
              {navCategories.map(parent => (
                <div key={parent.id} className="border-b border-gray-100 last:border-0">
                  <Link href={`/category/${parent.slug}`} onClick={() => setIsSearchDropdownOpen(false)} className="block px-4 py-3 bg-gray-50 font-bold text-ethoDark hover:text-haitiBlue hover:bg-gray-100 transition-colors">{parent.name}</Link>
                  {parent.children.map(sub => (
                    <Link key={sub.id} href={`/category/${sub.slug}`} onClick={() => setIsSearchDropdownOpen(false)} className="block px-8 py-3 text-sm text-gray-600 hover:text-haitiRed hover:bg-gray-50 transition-colors">{sub.name}</Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </form>

        <div className="bg-slate-800 text-white px-3 py-2.5 flex items-center gap-2 text-xs font-medium cursor-pointer border-t border-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0 text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <span className="truncate">
            Deliver to Haiti / USA
          </span>
        </div>

        <div className="bg-ethoDark text-white text-sm px-3 py-2 flex items-center gap-5 overflow-x-auto whitespace-nowrap no-scrollbar border-t border-gray-700">
          {navCategories.map(parent => (
            <Link key={parent.id} href={`/category/${parent.slug}`} className="cursor-pointer font-medium hover:text-gray-300 transition-colors">{parent.name}</Link>
          ))}
        </div>
      </nav>
    </>
  );
}