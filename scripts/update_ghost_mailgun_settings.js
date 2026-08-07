import crypto from 'crypto';

const GHOST_URL = 'https://lokha.today';
const ADMIN_KEY = process.env.GHOST_ADMIN_KEY || 'YOUR_GHOST_ADMIN_KEY';

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

async function updateGhostMailgunSettings() {
  const token = getAdminJWT();
  console.log('Updating Mailgun settings in Ghost Admin API...');

  const res = await fetch(`${GHOST_URL}/ghost/api/admin/settings/`, {
    method: 'PUT',
    headers: {
      'Authorization': `Ghost ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      settings: [
        { key: 'mailgun_domain', value: 'lokha.today' },
        { key: 'mailgun_api_key', value: process.env.MAILGUN_API_KEY || 'YOUR_MAILGUN_API_KEY' },
        { key: 'mailgun_base_url', value: 'https://api.mailgun.net/v3' },
        { key: 'members_support_address', value: 'hello@lokha.today' },
      ],
    }),
  });

  if (!res.ok) {
    console.error('Failed to update Ghost Admin settings:', res.status, await res.text());
    return;
  }

  const data = await res.json();
  console.log('Ghost Admin settings updated successfully! 🎉');
  console.log(JSON.stringify(data.settings.filter(s => s.key.startsWith('mailgun') || s.key.startsWith('members')), null, 2));
}

updateGhostMailgunSettings().catch(console.error);
