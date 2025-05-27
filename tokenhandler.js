const bcrypt = require("bcrypt");
const secretSalt = process.env.SECRET_SALT;

const { cfLoadConfig } = require('./configloader');
const { dbGetRole } = require("./dbhandler");

const userMap = new Map();   // username => { token, timeout }
const tokenMap = new Map();  // token => username

const config = cfLoadConfig('settings.config');

/**
 * Internal O(1) removal function (called on timeout or manually).
 */
async function removeUser(username) {
    const user = userMap.get(username);
    if (!user) return;

    clearTimeout(user.timeout);
    userMap.delete(username);
    tokenMap.delete(user.token);

    console.log(`${username} removed due to timeout`);
}

/**
 * Adds a user or refreshes an existing user's session timeout.
 */
async function tkAddUser(username) {
    let user = userMap.get(username);

    if (!user) {
        const token = await bcrypt.hash(username + secretSalt + Math.random() + Date.now(), 10);
        user = { token, timeout: null };
        userMap.set(username, user);
        tokenMap.set(token, username);
        console.log('added',token,username)
    }

    // Reset timeout
    if (user.timeout) clearTimeout(user.timeout);
    user.timeout = setTimeout(() => removeUser(username), config.TIMEOUT);

    return user.token;
}

/**
 * Extends a user's session.
 */
async function tkPingUser(username) {
    console.log(username," ping!");
    const user = userMap.get(username);
    if (!user) return false;

    clearTimeout(user.timeout);
    user.timeout = setTimeout(() => removeUser(username), config.TIMEOUT);
    return true;
}

/**
 * Checks if a user exists by username or token.
 */
async function tkUserExists(identifier) {
    return userMap.has(identifier) || tokenMap.has(identifier);
}

/**
 * Get user's role by token.
 */
async function tkGetRole(token) {
    const username = tokenMap.get(token);
    if (!username) return null;
    return await dbGetRole(username);
}

module.exports = {
    tkAddUser,
    tkPingUser,
    tkUserExists,
    tkGetRole
};
