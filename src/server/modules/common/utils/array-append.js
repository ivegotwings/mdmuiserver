module.exports = function arrayAppend(array, value) {
    let i = -1;
    let n = array.length;
    let array2 = new Array(n + 1);
    while (++i < n) {
        array2[i] = array[i];
    }
    array2[i] = value;
    return array2;
};
