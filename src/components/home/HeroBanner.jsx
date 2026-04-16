"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 0,
      tag: "The Proverb Collection",
      title: "\"Sak Vid Pa Kanpe\"",
      desc: "(An empty sack cannot stand). Fuel your spirit and represent your roots with our premium, culture-driven apparel.",
      cta: "Shop the Collection",
      link: "/", 
      bgClass: "bg-gradient-to-r from-blue-900 via-blue-800 to-red-800"
    },
    {
      id: 1,
      tag: "Partner Spotlight",
      title: "Future Ad Space",
      desc: "This banner is ready for your future brand partnerships, affiliate marketing promotions, or massive holiday sales.",
      cta: "Learn More",
      link: "/",
      bgClass: "bg-gradient-to-r from-red-900 via-red-700 to-orange-600"
    },
    {
      id: 2,
      tag: "New Arrivals",
      title: "Wear the Culture",
      desc: "Fresh designs just dropped. From vintage Tap Tap art to modern streetwear, represent Haiti wherever you go.",
      cta: "Shop New Arrivals",
      link: "/",
      bgClass: "bg-gradient-to-r from-slate-900 via-ethoDark to-haitiBlue"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
  const prevSlide = () => setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);

  return (
    /* Removed -mt-24. The banner will now sit perfectly below the header */
    <section className="relative overflow-hidden group mb-6 w-screen left-1/2 -translate-x-1/2">
      <div className="flex transition-transform duration-500 ease-in-out h-[400px] md:h-[450px]" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {slides.map((slide) => (
          <div key={slide.id} className={`w-full h-full flex-shrink-0 relative ${slide.bgClass} flex items-center`}>
            
            {/* Tailwind v4 Opacity Fix */}
            <div className="absolute inset-0 bg-black/20"></div>
            
            <div className="relative z-10 px-8 md:px-16 lg:px-24 flex flex-col items-start max-w-4xl w-full">
              <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-widest uppercase shadow-md">{slide.tag}</span>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">{slide.title}</h1>
              <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl drop-shadow-md font-medium">{slide.desc}</p>
              <Link href={slide.link} className="bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold text-lg px-8 py-4 rounded transition-colors shadow-lg border border-yellow-500">{slide.cta}</Link>
            </div>
          </div>
        ))}
      </div>
      
      {/* Tailwind v4 Opacity Fix for Buttons */}
      <button onClick={prevSlide} className="hidden md:flex absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg></button>
      <button onClick={nextSlide} className="hidden md:flex absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg></button>
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-20">
        {slides.map((_, index) => (
          <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}></button>
        ))}
      </div>
    </section>
  );
}