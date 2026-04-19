"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { createClient } from '@/lib/supabase';

export default function Header() {
  const cart = useCartStore((state) => state.cart);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // MANAGER FIX: Added `login` to the destructured store variables
  const { token, user, login, logout, lastActivity, updateActivity } = useAuthStore();
  const isLoggedIn = !!token;

  const [isMounted, setIsMounted] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(null);
 
  // Initialize Supabase
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ==========================================
  // MANAGER FIX: THE SUPABASE OAUTH LISTENER
  // ==========================================
  useEffect(() => {
    // This listens for when Google redirects the user back to the website
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Build the user object from Google's data
        const userMeta = session.user.user_metadata || {};
        const fullName = userMeta.full_name || `${userMeta.first_name || ''} ${userMeta.last_name || ''}`.trim() || session.user.email.split('@')[0];
        
        // Force Zustand to wake up and recognize the Google login!
        login(session.access_token, {
          id: session.user.id,
          email: session.user.email,
          name: fullName
        });
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [login, logout, supabase.auth]);

  // --- THE NATIVE SUPABASE FETCH ---
  useEffect(() => {
    async function fetchUserAddress() {
      if (isLoggedIn && user?.id) {
        try {
          // Fetch from our new 'profiles' table using the authenticated user's ID
          const { data, error } = await supabase
            .from('profiles')
            .select('city, postcode')
            .eq('id', user.id)
            .single();

          if (data && data.city) {
            setShippingAddress(data);
          }
        } catch (err) {
          console.error("Failed to fetch address from Supabase:", err);
        }
      } else {
        setShippingAddress(null);
      }
    }

    fetchUserAddress();
  }, [isLoggedIn, user]);

  // 24-HOUR INACTIVITY AUTO-LOGOUT GUARD
  useEffect(() => {
    if (!token) return;
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const checkSession = setInterval(() => {
      if (lastActivity && (Date.now() - lastActivity > TWENTY_FOUR_HOURS)) {
        logout();
        alert("Your session has expired due to 24 hours of inactivity. Please log in again.");
      }
    }, 60000);

    let throttleTimer;
    const handleActivity = () => {
       if (throttleTimer) return;
       throttleTimer = setTimeout(() => {
         updateActivity();
         throttleTimer = null;
       }, 5000);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('click', handleActivity);

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
  const [searchCategory, setSearchCategory] = useState("all");
  const [isCatMenuOpen, setIsCatMenuOpen] = useState(false);
  const router = useRouter();

  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // --- THE NEW PRINTIFY FETCH ---
  useEffect(() => {
    fetch('/api/categories')
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

  // UPDATED: Now closes both search dropdown AND custom category dropdown on scroll/click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        desktopSearchRef.current && !desktopSearchRef.current.contains(event.target) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)
      ) {
        setIsSearchDropdownOpen(false);
        setIsCatMenuOpen(false);
      }
    };

    const handleScroll = () => {
      setIsSearchDropdownOpen(false);
      setIsCatMenuOpen(false);
    };

    if (isSearchDropdownOpen || isCatMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isSearchDropdownOpen, isCatMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchQuery.trim() && searchCategory !== "all") {
      router.push(`/category/${searchCategory}`);
      setIsSearchDropdownOpen(false);
      setIsCatMenuOpen(false);
      setIsMenuOpen(false);
      return;
    }

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
    setIsCatMenuOpen(false);
    setIsMenuOpen(false);
  };

  // HELPER TO DISPLAY THE CORRECT CATEGORY NAME IN THE NEW DROPDOWN
  const getSelectedCategoryName = () => {
    if (searchCategory === "all") return "All";
    for (const parent of navCategories) {
      if (parent.slug === searchCategory) return parent.name;
      for (const sub of parent.children) {
        if (sub.slug === searchCategory) return sub.name;
      }
    }
    return "All";
  };

  let userLastName = "Shopper";
  if (user?.name) {
    const nameParts = user.name.trim().split(' ');
    userLastName = nameParts.length > 1 ?
nameParts[nameParts.length - 1] : nameParts[0];
  } else if (user?.email) {
    userLastName = user.email.split('@')[0];
  }

  if (userLastName.length > 7) {
    userLastName = userLastName.substring(0, 7) + '...';
  }

  // --- THE DYNAMIC DELIVERY LOCATION COMPONENT ---
  const DeliveryLocation = ({ isMobile }) => {
    if (!isMounted) return null;

    if (!isLoggedIn) {
      return (
        <>
          <span className={isMobile ? "text-gray-300 leading-tight font-medium" : "text-[11px] text-gray-300 leading-tight font-medium pl-4"}>Deliver to</span>
          <div className={`flex items-center gap-1 font-extrabold ${isMobile ? 'text-sm' : 'text-sm leading-tight'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            USA
          </div>
        </>
      );
    }

    if (isLoggedIn && !shippingAddress) {
      return (
        <>
          <span className={isMobile ? "text-gray-300 leading-tight font-medium" : "text-[11px] text-gray-300 leading-tight font-medium pl-1"}>Deliver to</span>
          <div className={`flex items-center font-extrabold ${isMobile ? 'text-sm ml-1' : 'text-sm leading-tight pl-1'}`}>
            Add address
          </div>
        </>
   
      );
    }

    return (
      <>
        <span className={isMobile ? "text-gray-300 leading-tight font-medium" : "text-[11px] text-gray-300 leading-tight font-medium pl-4"}>Deliver to</span>
        <div className={`flex items-center gap-1 font-extrabold ${isMobile ? 'text-sm' : 'text-sm leading-tight'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <span className="truncate max-w-[120px]">{shippingAddress.city}</span> ... {shippingAddress.postcode}
        </div>
      </>
    );
  };

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
            {isMounted && isLoggedIn ?
`Hello, ${userLastName}` : "Sign In"}
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
            <h3 className="font-extrabold text-xl mb-2 text-ethoDark">Shop by Category</h3>
            <ul className="space-y-4 text-gray-700">
              {navCategories.map(parent => 
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
              )}
            </ul>
          </div>
          <hr className="border-gray-200" />
          <div className="p-4">
             <h3 className="font-extrabold text-xl mb-2 text-ethoDark">Settings</h3>
            
             <ul className="space-y-4 text-gray-700">
               <Link href="/account" onClick={() => setIsMenuOpen(false)}>
                 <li className="cursor-pointer hover:text-haitiBlue hover:font-bold py-2">Your Account</li>
               </Link>
               {(!isMounted ||
!isLoggedIn) && (
                 <Link href="/account" onClick={() => setIsMenuOpen(false)}>
                   <li className="cursor-pointer hover:text-haitiBlue hover:font-bold py-2">Sign In</li>
                 </Link>
               )}
             </ul>
        
          </div>
        </div>
      </div>

      {/* DESKTOP HEADER */}
      <nav className="hidden md:flex flex-col w-full relative z-50">
        <div className="bg-gradient-to-r from-ethoDark via-slate-800 to-haitiBlue text-white px-4 py-2 flex items-center justify-between gap-4 border-b-[3px] border-haitiRed">
         
          <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <div className="relative flex items-center justify-center p-2">
  
              <div className="absolute inset-0 bg-white opacity-80 rounded-[40%] blur-md"></div>
              <img src="/logoethohaiticom1.png" alt="EthoHaiti Logo" className="h-20 w-auto object-contain relative z-10" />
            </div>
          </Link>

          {/* AMAZON STYLE DELIVER TO */}
          <Link href={isLoggedIn ?
"/addresses" : "/account"} className="flex flex-col text-white cursor-pointer hover:border-white border border-transparent p-1 rounded ml-2">
            <DeliveryLocation isMobile={false} />
          </Link>

          {/* AMAZON STYLE SEARCH BAR */}
          <form ref={desktopSearchRef} onSubmit={handleSearch} className="flex-grow flex relative max-w-4xl ml-4">
            <div className="flex w-full rounded-md bg-white focus-within:ring-2 focus-within:ring-haitiRed relative">
             
              {/* CUSTOM CATEGORY DROPDOWN */}
              <div
                className="relative flex-shrink-0 bg-gray-100 border-r border-gray-300 z-10 rounded-l-md"
                onMouseLeave={() => setIsCatMenuOpen(false)}
              >
              
                <button
                  type="button"
                  onClick={() => setIsCatMenuOpen(!isCatMenuOpen)}
                  className="flex items-center justify-center gap-1 text-black text-sm px-3 py-2.5 focus:outline-none h-full w-fit whitespace-nowrap hover:bg-gray-200 transition-colors rounded-l-md"
                >
            
                  <span className="truncate max-w-[120px] font-medium">{getSelectedCategoryName()}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                </button>
               
                {isCatMenuOpen && (
        
                  <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-gray-200 shadow-xl max-h-60 overflow-y-auto z-50 rounded-b-md">
                    <div
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-haitiBlue hover:text-white text-black transition-colors"
                      onClick={() => { setSearchCategory('all');
setIsCatMenuOpen(false); }}
                    >
                      All
                    </div>
                    {navCategories.map(parent => (
               
                      <div key={parent.id}>
                        <div className="px-3 py-1 text-[11px] font-extrabold bg-gray-100 text-gray-500 uppercase">{parent.name}</div>
                        {parent.children.map(sub => (
                          <div
         
                            key={sub.id}
                            className="px-4 py-2 text-sm cursor-pointer hover:bg-haitiBlue hover:text-white text-black transition-colors"
                            onClick={() => { setSearchCategory(sub.slug); setIsCatMenuOpen(false); }}
             
                          >
                            {sub.name}
                          </div>
                        ))}
         
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FIX: min-w-0 added here */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search EthoHaiti..."
                className="flex-grow min-w-0 px-4 py-2 text-black focus:outline-none"
              />
             
              {/* FIX: flex-shrink-0 added here */}
              <button type="submit" className="flex-shrink-0 bg-haitiRed hover:bg-red-700 text-white px-5 transition-colors flex items-center justify-center rounded-r-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
              </button>
            </div>
          </form>

          <Link href="/account" className="flex flex-col leading-tight p-1 border border-transparent hover:border-white cursor-pointer rounded text-white text-left ml-4">
            {isMounted && isLoggedIn ?
              (
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
                {isMounted ?
totalItems : 0}
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

      {/* MOBILE HEADER */}
      <nav className="md:hidden flex flex-col w-full bg-gradient-to-r from-ethoDark to-haitiBlue text-white border-b-[3px] border-haitiRed relative z-50 shadow-md">
       
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
                  <span className="text-sm font-bold">Sign in</span>
                </>
              )}
            </Link>

    
            <Link href="/cart" className="relative text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>
              <span className="absolute -top-1 right-0 text-haitiRed font-bold text-sm w-full text-center">
                {isMounted ?
totalItems : 0}
              </span>
            </Link>
          </div>
        </div>

        {/* MOBILE SEARCH - WITH PADDING AND CUSTOM DROPDOWN */}
        <form ref={mobileSearchRef} onSubmit={handleSearch} className="px-4 pb-4 relative">
          <div className="flex items-center bg-white shadow-inner relative border border-gray-300 rounded-md">
      
     
            {/* CUSTOM CATEGORY DROPDOWN MOBILE */}
            <div
              className="relative flex-shrink-0 bg-gray-100 border-r border-gray-300 z-10 rounded-l-md"
              onMouseLeave={() => setIsCatMenuOpen(false)}
            >
              <button
    
                type="button"
                onClick={() => setIsCatMenuOpen(!isCatMenuOpen)}
                className="flex items-center justify-center gap-1 text-black text-sm px-3 py-2.5 focus:outline-none h-full w-fit whitespace-nowrap hover:bg-gray-200 transition-colors rounded-l-md"
              >
                <span className="truncate max-w-[90px] font-medium">{getSelectedCategoryName()}</span>
       
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
              </button>
             
              {isCatMenuOpen && (
                <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-gray-200 shadow-xl max-h-60 overflow-y-auto z-50 rounded-b-md">
   
                  <div
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-haitiBlue hover:text-white text-black transition-colors"
                    onClick={() => { setSearchCategory('all');
setIsCatMenuOpen(false); }}
                  >
                    All
                  </div>
                  {navCategories.map(parent => (
                    <div key={parent.id}>
  
                      <div className="px-3 py-1 text-[11px] font-extrabold bg-gray-100 text-gray-500 uppercase">{parent.name}</div>
                      {parent.children.map(sub => (
                        <div
                         
                          key={sub.id}
                          className="px-4 py-2 text-sm cursor-pointer hover:bg-haitiBlue hover:text-white text-black transition-colors"
                          onClick={() => { setSearchCategory(sub.slug); setIsCatMenuOpen(false); }}
                        >
           
                          {sub.name}
                        </div>
                      ))}
                    </div>
                  ))}
 
                </div>
              )}
            </div>

            {/* FIX: min-w-0 and w-full added here */}
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search EthoHaiti..." className="flex-grow min-w-0 w-full px-3 py-2 text-black focus:outline-none" />
           
  
            {/* FIX: flex-shrink-0 added here */}
            <button type="submit" className="flex-shrink-0 bg-haitiRed text-white px-4 py-2 hover:bg-red-700 transition-colors h-full flex items-center justify-center rounded-r-md">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            </button>
      
          </div>
        </form>
       
        {/* MOBILE DELIVER TO BAR */}
        <Link href={isLoggedIn ?
"/addresses" : "/account"} className="bg-slate-800 text-white px-4 py-2.5 flex flex-row items-center gap-2 text-sm font-medium border-t border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors">
           <DeliveryLocation isMobile={true} />
        </Link>

        <div className="bg-ethoDark text-white text-sm px-3 py-2 flex items-center gap-5 overflow-x-auto whitespace-nowrap no-scrollbar border-t border-gray-700">
          {navCategories.map(parent => (
            <Link key={parent.id} href={`/category/${parent.slug}`} className="cursor-pointer font-medium hover:text-gray-300 transition-colors">{parent.name}</Link>
          ))}
 
        </div>
      </nav>
    </>
  );
}