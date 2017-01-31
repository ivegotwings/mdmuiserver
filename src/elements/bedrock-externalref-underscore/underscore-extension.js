if(_) {
    _.isNullOrEmpty = function(val, fallbackVal) {
        if(val) {
            for (var x in val) {
                return val;
            }
        }
        return fallbackVal;
    }
}