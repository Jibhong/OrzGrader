const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');

const { dbAddUser, dbRemoveUser, dbCheckUser, dbUserExists, dbPrintAllUsers } = require('./serverSideScript/dbhandler');
const { tkAddUser, tkUserExists, tkGetRole } = require('./serverSideScript/tokenhandler');
const { cfLoadJson } = require('./serverSideScript/configloader');

(async () => {
    const userExist = await dbUserExists('admin')
    if(userExist){
        await dbRemoveUser('admin');
    }
    await dbAddUser('admin', '1234', 'admin');
    await dbPrintAllUsers();
})();

const app = express();

app.use(express.json());

app.get('/', async (req, res) => {
    const indexPath = path.join(__dirname, 'page', 'login.html');
    res.sendFile(indexPath);
});

app.post('/api/page/redirect', async (req,res) => {
    const {token,target} = req.body;
    const userExist = await tkUserExists(token);
    if(!userExist) return res.redirect('/');

    const accessTable = await cfLoadJson('config/role_page_access.json');
    const role = await tkGetRole(token);
    const hasAccess = await accessTable.some(r => r.role === role && r.access.includes(target));
    if (!hasAccess){
        console.log(role);
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'page', target+".html"));
    console.log(target);
});

//is user online
//input token
//re online: true/false
app.post('/api/user/online', async (req,res) => {
    const {token} = req.body;
    const userExist = await tkUserExists(token);
    if(!userExist) return res.json({ online: false });
    res.json({ online: true });
});

app.post('/api/user/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) return res.status(200).json({ message: 'Missing credentials' });

    const valid = await dbCheckUser(username, password);

    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    const token = await tkAddUser(username);
    const redirectJs = fs.readFileSync(path.join(__dirname, 'clientSideScript', 'redirect.js'), 'utf8');
    res.json({ message: 'Login successful', token: token, redirectJs: redirectJs });
});

app.post('/api/user/register', async (req, res) => {
    const { username, password } = req.body;
    const userExist = await dbUserExists(username)
    if(userExist) return res.status(200).json({ message: 'User already exist' });

    if (!username || !password) return res.status(200).json({ message: 'Missing credentials' });
    await dbAddUser(username, password);
    res.json({ message: 'Register successful' });
});

app.post('/api/user/remove', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) return res.status(200).json({ message: 'Missing credentials' });

    const valid = await dbCheckUser(username, password);

    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    await dbRemoveUser(username);
    res.json({ message: 'User removed' });
});

app.get('/api/source/:rest', (req, res) => {
    // Extract requested file path after /source/
    const fileName = req.params.rest; // Express wildcard param
    console.log(fileName);
    const filePath = path.join(__dirname, 'page', fileName);

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

//problem set related api
app.post('/api/task/get', async (req,res) => {
    const {token,chunck} = req.body;
    const userExist = await tkUserExists(token);
    if(!userExist) return res.redirect('/');

    const accessTable = await cfLoadJson('config/role_page_access.json');
    const role = await tkGetRole(token);
    const hasAccess = await accessTable.some(r => r.role === role && r.access.includes('tasks'));
    if(!hasAccess) return res.redirect('/');

    if (!hasAccess){
        console.log(role);
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, (target+".html")));
    console.log(target);
});

app.use((req, res) => {
    res.status(404).send('Not found');
});


const options = {
    key: fs.readFileSync('certificate/key.pem'),
    cert: fs.readFileSync('certificate/cert.pem')
};

https.createServer(options, app).listen(6655, () => {
    console.log('HTTPS Server running at https://localhost:6655/');
});