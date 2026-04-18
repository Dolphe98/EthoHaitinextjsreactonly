// Capture Order - Calls our secure backend when user hits "Pay Now"
  const onApprove = async (data) => {
    // We grab the user from localStorage (authStore) if they are logged in
    const authStorage = JSON.parse(localStorage.getItem('ethohaiti-auth') || '{}');
    const user = authStorage?.state?.user;

    const res = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        orderID: data.orderID,
        cart: cart, // Pass the cart to the backend!
        userId: user?.id || null,
        userEmail: user?.email || null
      }),
    });
    
    const details = await res.json();

    if (details.status === "COMPLETED") {
      setPaymentSuccess(true);
      clearCart();
      // Wait a moment so they see the success screen, then route to their orders
      setTimeout(() => {
        router.push("/account/orders/recent"); 
      }, 3000);
    } else {
      alert("Payment failed or was declined by PayPal.");
    }
  };