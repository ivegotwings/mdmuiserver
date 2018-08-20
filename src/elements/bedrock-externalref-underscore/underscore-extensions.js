if (_) {
    _.isNullOrEmpty = function (val, fallbackVal) {
        if (val) {
            for (let x in val) {
                return val;
            }
        }
        return fallbackVal;
    };

    _.obj2list = function (obj) {
        let list = [];
        for (let key in obj) {
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
                let newObj = _.clone(currentObj);
                newObj[listToIterate[0].name] = d;
                _.iterateAndPopulateComboForCartesian(newObj, listToIterate.slice(1), result);
            })
        }
    };

    _.createCartesianObjects = function (obj) {
        let list = _.obj2list(obj);
        let result = [];
        _.iterateAndPopulateComboForCartesian({}, list, result);
        return result;
    };
}