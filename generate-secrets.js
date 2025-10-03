// Generate secure API keys and secrets
const crypto = require('crypto');

console.log('🔐 Generating Secure Keys...\n');

// Generate API Key (32 bytes, hex)
const apiKey = crypto.randomBytes(32).toString('hex');
console.log('API_KEY:');
console.log(apiKey);
console.log('');

// Generate JWT Secret (64 bytes, base64)
const jwtSecret = crypto.randomBytes(64).toString('base64');
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('');

// Generate shorter API Key for convenience (16 bytes)
const shortApiKey = crypto.randomBytes(16).toString('hex');
console.log('API_KEY (Short version):');
console.log(shortApiKey);
console.log('');

console.log('✅ Keys generated successfully!');
console.log('');
console.log('📋 Copy these to your Vercel Environment Variables:');
console.log('');
console.log(`API_KEY=${apiKey}`);
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('');
console.log('⚠️  Keep these keys secret and never commit them to git!');
