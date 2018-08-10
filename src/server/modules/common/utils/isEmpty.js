module.exports = function isEmpty(obj) {
    for (let x in obj) { return false; }
        return true;
};
