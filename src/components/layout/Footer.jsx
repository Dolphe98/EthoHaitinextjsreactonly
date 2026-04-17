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
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/account" className="hover:text-white transition-colors">Your Account</Link></li>
              <li><Link href="/orders" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Policies</Link></li>
            </ul>
          </div>

        </div>
      </div>

      <div className="bg-black py-6 mt-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-4">
          <span>© {new Date().getFullYear()} EthoHaiti Enterprise. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}