if (_) {
    _.isNullOrEmpty = function (val, fallbackVal) {
        if (val) {
            for (var x in val) {
                return val;
            }
        }
        return fallbackVal;
    };

    _.obj2list = function (obj) {
        var list = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                list.push({
                    name: key,
                    val: obj[key]
                });
            }
        }
        return list;
    };

    _.iterateAndPopulateComboForCartesian = function (currentObj, listToIterate, result) {
        if (listToIterate.length == 0) {
            result.push(currentObj);
        } else {
            listToIterate[0].val.forEach(function (d) {
                var newObj = _.clone(currentObj);
                newObj[listToIterate[0].name] = d;
                _.iterateAndPopulateComboForCartesian(newObj, listToIterate.slice(1), result);
            })
        }
    };

    _.createCartesianObjects = function (obj) {
        var list = _.obj2list(obj);
        var result = [];
        _.iterateAndPopulateComboForCartesian({}, list, result);
        return result;
    };
}