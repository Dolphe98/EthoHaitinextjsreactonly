"use client"; // Error components must be Client Components

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h2 className="text-3xl font-bold text-ethoDark mb-4">Something went wrong!</h2>
      <button 
        onClick={() => reset()} 
        className="px-6 py-3 bg-haitiRed text-white rounded-lg font-bold"
      >
        Try again
      </button>
    </div>
  );
}