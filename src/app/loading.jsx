export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ethoBg w-full">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-haitiBlue mb-4"></div>
      <h2 className="text-xl font-bold text-ethoDark tracking-wide">
        Loading...
      </h2>
    </div>
  );
}