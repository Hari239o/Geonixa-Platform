(async () => {
  try {
    const payload = {
      email: "test-recipient@example.com",
      password: "Passw0rd!",
      name: "Test Recipient",
      college: "Local College",
      domain: "general",
      slot: "Morning",
      day: "2026-05-22"
    };

    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log('HTTP', res.status, text);
  } catch (err) {
    console.error('Request failed:', err);
  }
})();
