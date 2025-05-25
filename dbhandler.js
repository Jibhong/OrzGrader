require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
};

const secretSalt = process.env.SECRET_SALT;

// Add a new user with hashed password
async function dbAddUser(username, password, role = 'user') {
    const connection = await mysql.createConnection(dbConfig);
    const hashed = await bcrypt.hash(password+secretSalt, 10);
    await connection.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashed, role]
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

    return bcrypt.compare(password+secretSalt, rows[0].password);
}

async function dbUserExists(username) {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
        'SELECT 1 FROM users WHERE username = ? LIMIT 1',
        [username]
    );
    await connection.end();

    return rows.length > 0;
}

async function dbPrintAllUsers() {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT username, password, role FROM users');
    await connection.end();

    rows.forEach(user => {
        console.log(`Username: ${user.username}, Role: ${user.role}`);
        // console.log(`Username: ${user.username}, Password: ${user.password}, Role: ${user.role}`);
    });
}

async function dbRemoveUser(username) {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
        'DELETE FROM users WHERE username = ?',
        [username]
    );
    await connection.end();

    return result.affectedRows > 0; // true if a user was deleted
}


module.exports = {
    dbAddUser,
    dbCheckUser,
    dbUserExists,
    dbRemoveUser,
    dbPrintAllUsers
};