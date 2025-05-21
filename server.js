const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const express = require('express');

const { dbAddUser, dbCheckUser } = require('./dbhandler');

(async () => {
    await dbAddUser('alice', 'mypassword');

    const valid = await dbCheckUser('alice', 'mypassword');
    console.log('Password valid?', valid);
})();

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'login.html');
    res.sendFile(indexPath);
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Missing credentials' });
    }

    const valid = await dbCheckUser(username, password);
    if (valid) {
        res.json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.get('/source/:rest', (req, res) => {
    // Extract requested file path after /source/
    const fileName = req.params.rest; // Express wildcard param
    console.log(fileName);
    const filePath = path.join(__dirname, fileName);

    // Optional: restrict to certain extensions for security
    const allowedExts = ['.js', '.css', '.html', '.png', '.jpg', '.jpeg', '.gif', '.svg'];
    const ext = path.extname(fileName).toLowerCase();

    if (!allowedExts.includes(ext)) {
        return res.status(403).send('Forbidden file type');
    }

    // Set MIME types
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
            res.status(404).send('File not found');
            return;
        }
        res.set('Content-Type', contentType);
        res.send(data);
    });
});

app.use((req, res) => {
    res.status(404).send('Not found');
});


const options = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
};

https.createServer(options, app).listen(6655, () => {
    console.log('HTTPS Server running at https://localhost:6655/');
});