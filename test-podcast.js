// Test podcast generation
const http = require('http');

console.log('🎙️  Testing Podcast Generation...\n');

// Test 1: Check service status
function checkStatus() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/admin/debug/status',
      method: 'GET',
      headers: {
        'x-api-key': 'test_api_key',
        'Authorization': 'Bearer test_token'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('📊 Service Status:');
        console.log(JSON.stringify(JSON.parse(data), null, 2));
        console.log('\n');
        resolve(JSON.parse(data));
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Test 2: Generate script
function generateScript() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      category_id: 'technology',
      language: 'en'
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/admin/debug/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-api-key': 'test_api_key',
        'Authorization': 'Bearer test_token'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('🎬 Script Generation Result:');
        if (res.statusCode === 200) {
          const result = JSON.parse(data);
          console.log('✅ Success!');
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('❌ Failed:', res.statusCode);
          console.log(data);
        }
        resolve();
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Run tests
async function runTests() {
  try {
    await checkStatus();
    await generateScript();
    console.log('\n✨ Test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
