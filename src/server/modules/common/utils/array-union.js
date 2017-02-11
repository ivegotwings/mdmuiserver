module.exports = function unionArrays(a, b) {
    const cache = {};

    a.forEach(item => cache[item] = item);
    b.forEach(item => cache[item] = item);

    return Object.keys(cache).map(key => cache[key]);
};