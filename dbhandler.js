require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
};

// Add a new user with hashed password
async function dbAddUser(username, password) {
    const connection = await mysql.createConnection(dbConfig);
    const hashed = await bcrypt.hash(password, 10);
    await connection.execute(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashed]
    );
    await connection.end();
}

// Check username and password
async function dbCheckUser(username, password) {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
        'SELECT password FROM users WHERE username = ?',
        [username]
    );
    await connection.end();

    if (rows.length === 0) return false; // user not found

    return bcrypt.compare(password, rows[0].password);
}

module.exports = {
    dbAddUser,
    dbCheckUser
};