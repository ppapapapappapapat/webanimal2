import { createServer } from 'https';
import { readFileSync } from 'fs';
import next from 'next';

console.log('🚀 Starting Animal Detection HTTPS Server...');

// Read certificate file
const httpsOptions = {
  pfx: readFileSync('cert.pfx'),
  passphrase: 'password123'
};

console.log('✅ SSL certificates loaded');

const app = next({
  dev: true,
  hostname: '0.0.0.0',
  port: 3000,
});

console.log('🔄 Preparing Next.js application...');

app.prepare().then(() => {
  console.log('✅ Next.js app ready');
  
  const server = createServer(httpsOptions, (req, res) => {
    return app.getRequestHandler()(req, res);
  });

  server.listen(3000, '0.0.0.0', (err) => {
    if (err) {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
    
    console.log('');
    console.log('✨ ANIMAL DETECTION APP RUNNING! ✨');
    console.log('=====================================');
    console.log('📱 On your MOBILE:');
    console.log('   https://192.168.100.77:3000');
    console.log('');
    console.log('💻 On your LAPTOP:');
    console.log('   https://localhost:3000');
    console.log('');
    console.log('⚠️  You will see security warnings - this is normal!');
    console.log('   Click "Advanced" → "Proceed"');
    console.log('');
  });
  
}).catch(err => {
  console.error('❌ Failed to prepare Next.js app:', err);
  process.exit(1);
});