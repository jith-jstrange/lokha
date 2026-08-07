import nodemailer from 'nodemailer';

async function test() {
  const transporter = nodemailer.createTransport({
    host: 'lokha-mailserver-production.up.railway.app',
    port: 8080, // or test direct HTTP or SMTP
    secure: false,
    tls: { rejectUnauthorized: false }
  });
}
