async function testSignup() {
  console.log('Sending test member signup request...');
  const res = await fetch('https://lokha.today/members/api/send-magic-link/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://lokha.today',
      'Referer': 'https://lokha.today/',
    },
    body: JSON.stringify({
      email: 'jith.test@example.com',
      emailType: 'signup',
    }),
  });

  console.log('Response Status:', res.status);
  const text = await res.text();
  console.log('Response Body:', text);
}

testSignup().catch(console.error);
