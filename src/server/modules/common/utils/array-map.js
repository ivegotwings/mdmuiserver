module.exports = function arrayMap(array, selector) {
    let i = -1;
    let n = array.length;
    let array2 = new Array(n);
    while (++i < n) {
        array2[i] = selector(array[i], i, array);
    }
    return array2;
};
