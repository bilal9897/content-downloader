const http = require('http');

const data = JSON.stringify({
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/info',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        console.log('Response Body:', body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
