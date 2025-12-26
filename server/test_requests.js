const http = require('http');

function request(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

(async () => {
  try {
    console.log('GET /api/driver/dashboard');
    const r1 = await request('/api/driver/dashboard');
    console.log('Status:', r1.status);
    console.log('Body:', r1.body);

    console.log('\nGET /api/ambulance/my-requests');
    const r2 = await request('/api/ambulance/my-requests');
    console.log('Status:', r2.status);
    console.log('Body:', r2.body);
  } catch (e) {
    console.error('Request error:', e.message || e);
  }
})();
