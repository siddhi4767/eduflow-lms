const email = `test-${Date.now()}@example.com`;

async function test() {
  console.log(`Sending registration request for ${email}...`);
  try {
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: email,
        password: "password123"
      })
    });
    
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text}`);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

test();
