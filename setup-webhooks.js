const API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6ImFkMWI3ZDRjNWVlYmIzNTU0OTdkNWY1ZjJkMmU0MGM3NTAxOTNmNjJhMTQ3NTRjYzhiZjBlNTBmMTcyYTQ0ODNhMDkyMDg2MjBkMmNmYTBjIiwiaWF0IjoxNzc2NDIxNzEyLjMwODU4MiwibmJmIjoxNzc2NDIxNzEyLjMwODU4NCwiZXhwIjoxODA3OTU3NzEyLjMwMzY5OSwic3ViIjoiMjY0ODc3MDYiLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIiwidXNlci5pbmZvIl19.kHDTr6Xio2vycl6ob3WyRT1UWyRH-qERWKBBNGfPxkwGgjIYsHSeJcKqwZEUN7x6kzb2CeTlWFEQkQibsZ9c1PuKjWP5gY-5Ei9MuHnsuQ2DoNFP0fEYMJLN3bksfBwc6nliVpK8IGFY_yQ-nJXvLaSzgjkAU7dGCjGdgqKf-KWZyTbg28wYXyQI3fAEMPjd_ENsj-EtZZezyEeUVgasoQtiKk1dBy1GzWat3LB9bvJbnPs7xfqJ4nqLszHcsd_QYzrflk-2lI2IOgTIiO-pWr1edcbaFJhEdgtQdWla6T9e3Kh9Fz-hV_BKAxOJn_fFK5iMtXcLIgNoPUnp6rU5s-5cGcKhV1h8nUVxyYppGSnbJEG6_h6yoyABKCRZdhwnkASGKboiGNFq8obULcVobEX-ZI80v-iE886K4IiWmg7qaYRxqUYBB6nTFX6xSUVvYy9yffH3w-frfEa8crfNYs4EkQBoocMH6TOkHeOgrk-H2s0uAYm91L0lFKLKmfWCpHCBwnq0iQ-uUekjyTr3is5Jbv4cnAMAjr0f7gKArz4GIr_pE4kYnPjxr1ZesYXDLKnWgKmnh6y4oSNYvhM3jxcJrf0-4rBjYgSlX9KkaROGBgxzuf2a9G_nicfEywOsiw9R4h0CrOPydW83HnwazB8SLRcnJAinK7I0DdlF3TI";
const SHOP_ID = "26618651";

// ⚠️ MUST BE YOUR LIVE URL, NOT LOCALHOST
const VERCEL_WEBHOOK_URL = "https://ethohaiti.com/api/webhooks/printify"; 

// The exact events your route.js file is programmed to listen for
const webhooksToRegister = [
  "product:publish:started",
  "order:canceled",
  "order:sent-to-production",
  "order:shipment:created",
  "order:shipment:delivered"
];

async function registerWebhooks() {
  console.log(`🚀 Linking Printify to: ${VERCEL_WEBHOOK_URL}`);
  console.log("==================================================");

  for (const topic of webhooksToRegister) {
    console.log(`▶️ Registering Event: ${topic}`);

    try {
      const res = await fetch(`https://api.printify.com/v1/shops/${SHOP_ID}/webhooks.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: topic,
          url: VERCEL_WEBHOOK_URL
        })
      });

      if (res.ok) {
        console.log(`  ✅ SUCCESS: Printify will now send ${topic} events to Vercel.`);
      } else {
        const errText = await res.text();
        console.log(`  ⚠️ FAILED (Usually means it's already registered):`, errText);
      }
    } catch (err) {
      console.error(`  ❌ CRITICAL ERROR:`, err);
    }
    
    // 500ms delay to keep Printify's API happy
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log("\n🏁 Done! Your Printify automation is fully wired up.");
}

registerWebhooks();