module.exports = function arraySlice(array, indexArg, endArg) {
    let index = indexArg || 0;
    let i = -1;
    let n = array.length - index;

    if (n < 0) {
        n = 0;
    }

    if (endArg > 0 && n > endArg) {
        n = endArg;
    }

    let array2 = new Array(n);
    while (++i < n) {
        array2[i] = array[i + index];
    }
    return array2;
};
