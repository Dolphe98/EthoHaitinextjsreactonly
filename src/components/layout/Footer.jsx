"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [footerCategories, setFooterCategories] = useState([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        const cleanName = (name) => {
          if (!name) return "";
          return name.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&");
        };

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
        
        setFooterCategories(hierarchy);
      })
      .catch(err => console.error("Error fetching footer categories:", err));
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-ethoDark text-white w-full mt-auto">
      <button onClick={scrollToTop} className="w-full bg-slate-700 hover:bg-slate-600 text-sm font-bold py-4 text-center transition-colors">
        Back to top
      </button>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* DYNAMIC COLUMN 1: SHOP BY CATEGORY */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-extrabold mb-4 border-l-4 border-haitiRed pl-2">Shop by Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {footerCategories.map(parent => (
                <div key={parent.id} className="mb-4">
                  <Link href={`/category/${parent.slug}`} className="hover:text-haitiBlue transition-colors font-bold text-white text-base block">{parent.name}</Link>
                  <ul className="ml-3 mt-2 border-l border-gray-600 pl-3 space-y-2 text-gray-400">
                    {parent.children.map(sub => (
                       <li key={sub.id}><Link href={`/category/${sub.slug}`} className="hover:text-white transition-colors text-sm">{sub.name}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 2: GET TO KNOW US */}
          <div>
            <h3 className="text-lg font-extrabold mb-4 border-l-4 border-haitiRed pl-2">Get to Know Us</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="/mission" className="hover:text-white transition-colors">The Culture & Mission</Link></li>
            </ul>
          </div>

          {/* COLUMN 3: CUSTOMER SERVICE */}
          <div>
            <h3 className="text-lg font-extrabold mb-4 border-l-4 border-haitiRed pl-2">Let Us Help You</h3>
            
            {/* Account & Tracking */}
            <ul className="space-y-3 text-sm text-gray-300 mb-6">
              <li><Link href="/account" className="hover:text-white transition-colors">Your Account</Link></li>
              <li><Link href="/orders" className="hover:text-white transition-colors">Track Your Order</Link></li>
            </ul>

            {/* NEW: Contact Section */}
            <h4 className="text-sm font-extrabold text-white mb-3">Contact Us at:</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <a href="https://wa.me/18495067098" target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  +1 (849) 506-7098
                </a>
              </li>
              <li>
                <a href="mailto:sakpase@ethohaiti.com" className="hover:text-haitiBlue transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.909A2.25 2.25 0 0 1 2.25 6.993V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25" /></svg>
                  sakpase@ethohaiti.com
                </a>
              </li>
            </ul>

          </div>

        </div>
      </div>

      <div className="bg-black py-6 mt-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-4">
          <span>© {new Date().getFullYear()} EthoHaiti Enterprise. All rights reserved.</span>
          
          {/* THE NEW LEGAL LINKS */}
          <div className="flex flex-wrap justify-center gap-4 font-bold">
            <Link href="/returns" className="hover:text-white transition-colors">Returns Policy</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
            <Link href="/copyright" className="hover:text-white transition-colors">Copyright Policy</Link>
          </div>

        </div>
      </div>
    </footer>
  );
}