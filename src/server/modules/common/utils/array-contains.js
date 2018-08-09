module.exports = function arrayContains(arr, needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    let findNaN = needle !== needle;
    let indexOf;

    if(!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            let i = -1, index = -1;

            for(i = 0; i < arr.length; i++) {
                let item = arr[i];

                if((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(arr, needle) > -1;
};