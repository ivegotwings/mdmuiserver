module.exports = function isEmpty(obj) {
    for (var x in obj) { return false; }
        return true;
};
