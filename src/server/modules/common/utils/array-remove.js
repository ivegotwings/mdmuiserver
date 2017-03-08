module.exports = function (arr, val) {
    var index = -1;

    index = arr.indexOf(val);

    while (index >= 0) {
        arr.splice(index, 1);
        index = arr.indexOf(val);
    }
};