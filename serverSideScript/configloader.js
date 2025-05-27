const fs = require('fs');

function cfLoadConfig(filepath) {
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


const __cfJsonCache = {};

function cfLoadJson(filepath) {
    const raw = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(raw);
}

module.exports = {
    cfLoadConfig,
    cfLoadJson
};