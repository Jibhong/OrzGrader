const { tkUserExists, tkGetRole } = require("./tokenhandler");
const { cfLoadConfig, cfLoadJson } = require("./configloader");


async function ahHaveaccess(token, target) {
    const userExist = await tkUserExists(token);
    if(!userExist) return false

    const accessTable = await cfLoadJson('config/role_page_access.json');
    const role = await tkGetRole(token);
    const hasAccess = await accessTable.some(r => r.role === role && r.access.includes(target));
    if(!hasAccess) return false;
    return true;
}

module.exports = {
    ahHaveaccess
};