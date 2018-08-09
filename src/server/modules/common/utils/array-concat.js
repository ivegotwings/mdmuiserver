module.exports = function arrayConcat(array, other) {
    if (!array) {
        return other;
    }
    let i = -1,
        j = -1;
    let n = array.length;
    let m = other.length;
    let array2 = new Array(n + m);
    while (++i < n) {
        array2[i] = array[i];
    }
    while (++j < m) {
        array2[i++] = other[j];
    }
    return array2;
};
