export default async function OrderDetailsPage({ params }) {
  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  return (
    <div className="pt-32 pb-20 min-h-screen bg-ethoBg text-center">
      <h1 className="text-4xl font-extrabold text-ethoDark">Order #{orderId}</h1>
      <p className="text-gray-500 mt-4">Your order details and tracking will appear here.</p>
    </div>
  );
}