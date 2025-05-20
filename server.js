const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const options = {
    key: fs.readFileSync(path.join(__dirname, 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
};

https.createServer(options, (req, res) => {
    const parsedUrl = url.parse(req.url);
    if (req.method === 'GET' && req.url === '/') {
        const indexPath = path.join(__dirname, 'login.html');
        fs.readFile(indexPath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading login.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }else if (parsedUrl.pathname.startsWith('/source/')) {
        const fileName = parsedUrl.pathname.replace('/source/', '');
        const filePath = path.join(__dirname, fileName);

        // Optionally restrict to only certain file types or use a MIME lookup
        const ext = path.extname(fileName);
        const contentTypes = {
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.html': 'text/html',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml'
        };
        const contentType = contentTypes[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    }else if (req.method === 'POST' && req.url === '/login') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const { username, password } = data;

                console.log('Received login:', username, password);

                // Dummy validation
                if (username && password) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Login successful' }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Missing credentials' }));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid JSON' }));
            }
        });
    } else {
        // Redirect to login page
        res.writeHead(302, { 'Location': '/' });
        res.end();
        // res.writeHead(404, { 'Content-Type': 'text/html' });
        // res.end('error');
    }
}).listen(6655, () => {
    console.log('HTTPS Server running at https://localhost:6655/');
});
