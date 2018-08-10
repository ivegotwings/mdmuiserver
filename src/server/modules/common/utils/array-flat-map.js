module.exports = function arrayFlatMap(array, selector) {
    let index = -1;
    let i = -1;
    let n = array.length;
    let array2 = [];
    while (++i < n) {
        let array3 = selector(array[i], i, array);
        let j = -1;
        let k = array3.length;
        while (++j < k) {
            array2[++index] = array3[j];
        }
    }
    return array2;
};
