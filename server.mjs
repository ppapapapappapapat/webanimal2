import { createServer } from 'https';
import { parse } from 'url';
import next from 'next';
import { generateKeyPairSync } from 'crypto';

// Generate self-signed certificate
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: privateKey,
  cert: publicKey,
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log('');
    console.log('🚀 Animal Detection App Running with HTTPS!');
    console.log('');
    console.log('📱 On your MOBILE, go to:');
    console.log('   https://192.168.100.77:3000');
    console.log('');
    console.log('💻 On your LAPTOP, go to:');
    console.log('   https://localhost:3000');
    console.log('');
    console.log('⚠️  You will see a security warning - click "Advanced" then "Proceed"');
    console.log('');
  });
});