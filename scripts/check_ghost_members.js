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

async function checkGhostSettings() {
  const token = getAdminJWT();
  console.log('Fetching Ghost Admin Settings...');

  const res = await fetch(`${GHOST_URL}/ghost/api/admin/settings/`, {
    headers: {
      Authorization: `Ghost ${token}`,
    },
  });

  if (!res.ok) {
    console.error('Failed to fetch settings:', res.status, await res.text());
    return;
  }

  const data = await res.json();
  const settings = data.settings;

  const relevantKeys = [
    'members_signup_access',
    'members_support_address',
    'portal_name',
    'portal_plans',
    'portal_button',
    'mailgun_domain',
    'mailgun_api_key',
    'mailgun_base_url'
  ];

  console.log('--- Ghost Member & Portal Settings ---');
  for (const s of settings) {
    if (relevantKeys.includes(s.key)) {
      console.log(`${s.key}:`, s.value);
    }
  }
}

checkGhostSettings().catch(console.error);
