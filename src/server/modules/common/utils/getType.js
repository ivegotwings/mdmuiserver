let isObject = require("./../support/isObject");

module.exports = function getType(node, anyType) {
    let type = isObject(node) && node.$type || void 0;
    if (anyType && type) {
        return "branch";
    }
    return type;
};
