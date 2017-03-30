(function (document) {
    Array.prototype.find = function(predicate) {
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }
        var o = Object(this);
        var len = o.length >>> 0;
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var thisArg = arguments[1];

        var k = 0;
        while (k < len) {
            var kValue = o[k];
            if (predicate.call(thisArg, kValue, k, o)) {
                return kValue;
            }
            k++;
        }
        return undefined;
    };

    Object.is = function(firstObject, secondObject) {
        var firstObjectProps = Object.getOwnPropertyNames(firstObject);
        var secondObjectProps = Object.getOwnPropertyNames(secondObject);

        if (firstObjectProps.length != secondObjectProps.length) {
            return false;
        }

        for (var i = 0; i < firstObjectProps.length; i++) {
            var propName = firstObjectProps[i];
            if (firstObject[propName] !== secondObject[propName]) {
                return false;
            }
        }
        
        return true;
    };
})(document);


