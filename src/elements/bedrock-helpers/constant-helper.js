window.ConstantHelper = window.ConstantHelper || {};

ConstantHelper.DATATYPE_STRING = '_STRING';
ConstantHelper.DATATYPE_INTEGER = '_INTEGER';
ConstantHelper.DATATYPE_DECIMAL = '_DECIMAL';
ConstantHelper.DATATYPE_DATE = '_DATE';
ConstantHelper.DATATYPE_DATETIME = '_DATETIME';
ConstantHelper.DATATYPE_BOOLEAN = '_BOOLEAN';

ConstantHelper.NULL_VALUE = '_NULL';

ConstantHelper.getDataTypeConstant = function (datatype) {
    let constantVal;

    switch(datatype) {
        case "string":
            constantVal = ConstantHelper.DATATYPE_STRING;
            break;
        case "integer":
            constantVal = ConstantHelper.DATATYPE_INTEGER;
            break;
        case "decimal":
            constantVal = ConstantHelper.DATATYPE_DECIMAL;
            break;
        case "date":
            constantVal = ConstantHelper.DATATYPE_DATE;
            break;
        case "datetime":
            constantVal = ConstantHelper.DATATYPE_DATETIME;
            break;
        case "boolean":
            constantVal = ConstantHelper.DATATYPE_BOOLEAN;
            break;
    }

    return constantVal;
};

ConstantHelper.MILLISECONDS_10 = 10;
ConstantHelper.MILLISECONDS_30 = 30;
ConstantHelper.MILLISECONDS_100 = 100;
ConstantHelper.MILLISECONDS_300 = 300;
ConstantHelper.MILLISECONDS_1000 = 1000;
ConstantHelper.MILLISECONDS_5000 = 5000;
ConstantHelper.MILLISECONDS_10000 = 10000;
