import crypto from 'crypto';

const GHOST_URL = 'https://lokha.today';
const ADMIN_KEY = '6a72fe11765b1200012a5241:a775afea31694d4903fb1db323945025c4fd846b312e7897f984e909c4f8a069';

function base64url(bufOrStr) {
  return Buffer.from(bufOrStr).toString('base64url');
}

function getAdminJWT() {
  const [id, secret] = ADMIN_KEY.split(':');
  const header = { alg: 'HS256', typ: 'JWT', kid: id };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iat: now, exp: now + 300, aud: '/admin/' };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const token = `${encodedHeader}.${encodedPayload}`;

  const hmac = crypto.createHmac('sha256', Buffer.from(secret, 'hex'));
  hmac.update(token);
  const signature = hmac.digest('base64url');

  return `${token}.${signature}`;
}

async function testGhostMail() {
  const token = getAdminJWT();
  console.log('Sending Ghost Admin test email to verify SMTP connection...');

  const res = await fetch(`${GHOST_URL}/ghost/api/admin/mail/test/`, {
    method: 'POST',
    headers: {
      'Authorization': `Ghost ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mail: [
        {
          message: {
            to: '7c0f4b001@smtp-brevo.com',
            subject: 'Ghost Test Email',
            html: '<p>Testing Ghost SMTP</p>',
          },
        },
      ],
    }),
  });

  console.log('Test Mail Status:', res.status);
  const text = await res.text();
  console.log('Test Mail Response:', text);
}

testGhostMail().catch(console.error);
