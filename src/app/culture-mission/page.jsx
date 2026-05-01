import Link from 'next/link';

export const metadata = {
  title: "Culture & Mission | EthoHaiti",
  description: "Discover the heartbeat, ancestral proverbs, and unbreakable spirit driving EthoHaiti.",
};

export default function CultureMissionPage() {
  return (
    <main className="pt-32 pb-20 min-h-[80vh] bg-ethoBg flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      
      {/* Subtle Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-50 rounded-full blur-3xl opacity-50 pointer-events-none -z-10"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <span className="bg-ethoDark text-white text-xs font-black px-4 py-1.5 rounded-full tracking-widest uppercase shadow-md mb-6 inline-block border border-gray-700">
          Coming Soon
        </span>
        
        <h1 className="text-5xl md:text-6xl font-black text-ethoDark mb-6 tracking-tight uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>
          The Soul of EthoHaiti
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 font-medium mb-10 leading-relaxed">
          We are currently crafting our Culture & Mission page. This space will dive deep into the ancestral proverbs, the unbreakable spirit of Haiti, and the vision driving our premium streetwear. We speak without saying a word—and soon, we'll share the full story with you.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 bg-haitiRed hover:bg-red-700 text-white font-extrabold text-lg px-8 py-4 rounded transition-all shadow-md hover:scale-[1.02] w-full sm:w-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to the Store
          </Link>
        </div>
      </div>
    </main>
  );
}