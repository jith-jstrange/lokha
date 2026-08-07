import tls from 'tls';
import net from 'net';

const host = 'smtp-relay.brevo.com';
const user = '7c0f4b001@smtp-brevo.com';
const pass = 'bskoJ93OooXQQ6C';

function testPort(port, useTLS) {
  return new Promise((resolve) => {
    console.log(`Testing ${host}:${port} (useTLS: ${useTLS})...`);
    const socket = useTLS 
      ? tls.connect(port, host, { rejectUnauthorized: false }, () => onConnect())
      : net.createConnection(port, host, () => onConnect());

    let step = 0;
    socket.setTimeout(8000);

    socket.on('data', (data) => {
      const msg = data.toString();
      console.log(`[${port} IN]:`, msg.trim());

      if (step === 0 && msg.startsWith('220')) {
        step = 1;
        socket.write(`EHLO lokha.today\r\n`);
      } else if (step === 1 && msg.includes('250')) {
        step = 2;
        socket.write(`AUTH LOGIN\r\n`);
      } else if (step === 2 && msg.startsWith('334')) {
        step = 3;
        socket.write(Buffer.from(user).toString('base64') + '\r\n');
      } else if (step === 3 && msg.startsWith('334')) {
        step = 4;
        socket.write(Buffer.from(pass).toString('base64') + '\r\n');
      } else if (step === 4) {
        if (msg.startsWith('235')) {
          console.log(`\n🎉 SUCCESS: Port ${port} AUTHENTICATED PERFECTLY!`);
          resolve(true);
        } else {
          console.error(`❌ FAILED: Port ${port} auth error:`, msg.trim());
          resolve(false);
        }
        socket.end();
      }
    });

    function onConnect() {
      console.log(`Connected to ${host}:${port}`);
    }

    socket.on('error', (err) => {
      console.error(`❌ Error on port ${port}:`, err.message);
      resolve(false);
    });

    socket.on('timeout', () => {
      console.error(`❌ Timeout on port ${port}`);
      socket.destroy();
      resolve(false);
    });
  });
}

async function run() {
  await testPort(465, true);
  await testPort(587, false);
}

run();
