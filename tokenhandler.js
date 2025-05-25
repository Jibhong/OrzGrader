const bcrypt = require("bcrypt");
const secretSalt = process.env.SECRET_SALT;
const loadConfig = require('./configloader');
const config = loadConfig('setting.config');

const userMap = new Map();   // username => { token, timeout }
const tokenMap = new Map();  // token => username

/**
 * Internal O(1) removal function (called on timeout or manually).
 */
function removeUser(username) {
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
    }

    // Reset timeout
    if (user.timeout) clearTimeout(user.timeout);
    user.timeout = setTimeout(() => removeUser(username), config.TIMEOUT);

    return user.token;
}

/**
 * Extends a user's session.
 */
function tkPingUser(username) {
    const user = userMap.get(username);
    if (!user) return false;

    clearTimeout(user.timeout);
    user.timeout = setTimeout(() => removeUser(username), config.TIMEOUT);
    return true;
}

/**
 * Checks if a user exists by username or token.
 */
function tkUserExists(identifier) {
    return userMap.has(identifier) || tokenMap.has(identifier);
}

module.exports = {
    tkAddUser,
    tkPingUser,
    tkUserExists,
    removeUser // optional, if you want to remove manually too
};
