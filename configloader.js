const fs = require('fs');

/**
 * Loads key-value settings from a config file and returns them as an object.
 * Supports basic type parsing: numbers, booleans, and strings.
 *
 * @param {string} filepath - Path to the config file
 * @returns {Object} Parsed configuration object
 */
function loadConfig(filepath) {
    const config = {};
    const raw = fs.readFileSync(filepath, 'utf-8');

    raw.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const [key, value] = trimmed.split('=');
        if (key && value !== undefined) {
            let parsed;
            if (!isNaN(value)) parsed = Number(value);
            else if (value.toLowerCase() === 'true') parsed = true;
            else if (value.toLowerCase() === 'false') parsed = false;
            else parsed = value;

            config[key.trim()] = parsed;
        }
    });

    return config;
}

module.exports = loadConfig;
