import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const GHOST_URL = 'https://lokha.today';
const ADMIN_KEY = '6a72fe11765b1200012a5241:a775afea31694d4903fb1db323945025c4fd846b312e7897f984e909c4f8a069';
const THEME_NAME = 'journey_of_lokha';

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

async function uploadAndActivateTheme() {
  const zipPath = path.join('/home/jith/Projects/lokha/lokha-ghost-themes', `${THEME_NAME}.zip`);
  const fileBuffer = fs.readFileSync(zipPath);
  const blob = new Blob([fileBuffer], { type: 'application/zip' });

  const formData = new FormData();
  formData.append('file', blob, `${THEME_NAME}.zip`);

  const token = getAdminJWT();
  console.log(`Uploading theme '${THEME_NAME}' to Ghost...`);

  const uploadRes = await fetch(`${GHOST_URL}/ghost/api/admin/themes/upload/`, {
    method: 'POST',
    headers: {
      Authorization: `Ghost ${token}`,
    },
    body: formData,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    console.error('Upload failed:', uploadRes.status, errText);
    process.exit(1);
  }

  const uploadData = await uploadRes.json();
  console.log('Upload result:', JSON.stringify(uploadData, null, 2));

  const uploadedThemeName = uploadData.themes[0].name;
  console.log(`Activating theme: ${uploadedThemeName}...`);

  const activeToken = getAdminJWT();
  const activateRes = await fetch(`${GHOST_URL}/ghost/api/admin/themes/${uploadedThemeName}/activate/`, {
    method: 'PUT',
    headers: {
      Authorization: `Ghost ${activeToken}`,
    },
  });

  if (!activateRes.ok) {
    const errText = await activateRes.text();
    console.error('Activation failed:', activateRes.status, errText);
    process.exit(1);
  }

  const activateData = await activateRes.json();
  console.log('\n========================================');
  console.log(`Theme '${THEME_NAME}' activated successfully on Ghost! 🎉`);
  console.log('Active Theme Name:', activateData.themes[0].name);
  console.log('========================================\n');
}

uploadAndActivateTheme().catch(console.error);
