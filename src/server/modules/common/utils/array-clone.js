module.exports = function arrayClone(array) {
    if (!array) {
        return array;
    }
    let i = -1;
    let n = array.length;
    let array2 = [];
    while (++i < n) {
        array2[i] = array[i];
    }
    return array2;
};
