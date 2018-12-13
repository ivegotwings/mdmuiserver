/*
`validation-helpers` Represents a bunch of helpers to work with validations that any bedrock, pebble, rock or app can use.
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
window.ValidationHelper = window.ValidationHelper || {};
ValidationHelper.requiredValidator=function(input) {
    return (input != undefined && input != "");
};

//For string input it will return true/false, for array input it will return true or array containing position of invalid value plus one
ValidationHelper.minLengthValidator=function(input, length) {
    if(Array.isArray(input)){
        let invalidValues = [];
        input.forEach(function(item,index){
            if(item.length < length){
                invalidValues.push(index + 1);
            }
        });
        if(invalidValues.length > 0){
            return invalidValues;
        }
        return true;
    }else{
        return input.length >= length;
    }
};

//For string input it will return true/false, for array input it will return true or array containing position of invalid value plus one.
ValidationHelper.maxLengthValidator=function(input, length) {
    if(Array.isArray(input)){
        let x = 10;
        let invalidValues = [];
        input.forEach(function(item,index){
            if(item.length > length){
                invalidValues.push(index + 1);
            }
        });
        if(invalidValues.length > 0){
            return invalidValues;
        }
        return true;

    }else{
        let x = 20;
        return input.length <= length;
    }
};

ValidationHelper.numberRangeValidator=function(value, min, max, minInclusive, maxInclusive) {
    if (isNaN(value)) {
        if (ValidationHelper.isFraction(value)) {
            let split = value.split('/');
            if (!isNaN(split[0]) && !isNaN(split[1])) {
                value = parseInt(split[0]) / parseInt(split[1]);
            }
        } else {
            return false;
        }
    }
    if (isNaN(min)) {
        return maxInclusive ? value <= Number(max) : value < Number(max);
    } else if (isNaN(max) || max=== "") {
        return minInclusive ? value >= Number(min) : value > Number(min);
    }

    let _isMinValid = minInclusive ? value >= Number(min) : value > Number(min);
    let _isMaxValid = maxInclusive ? value <= Number(max) : value < Number(max);

    return _isMinValid && _isMaxValid;
};

ValidationHelper.emailValidator=function(input) {
    let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(input);
};

ValidationHelper.regexValidator=function(input, pattern) {
    let regExp = new RegExp(pattern);
    return regExp.test(input);
};

ValidationHelper.integerValidator=function(input) {
    if(isNaN(input))
    {
        return false;
    }

    let _pattern = "^[0-9]+$";
    return ValidationHelper.regexValidator(input, _pattern);
};

ValidationHelper.decimalValidator=function(input) {
    if (input instanceof Array) {
        let error = true;
        for(let i=0;i<input.length;i++) {
            if(isNaN(input[i])) {
                error = false;
                break;
            }                    
        }
        return error;
    } else if(isNaN(input)) {            
        return false;           
    }
    
    return true;
};

ValidationHelper.booleanValidator=function(input) {
    // Input value is string, so comparing with boolean string.
    if(input == "" || input == ConstantHelper.NULL_VALUE)
    {
        return true;
    }
    if(input != null)
    {
        let lowerInputValue = input.toString().toLowerCase();
        if(lowerInputValue == "true" || lowerInputValue == "false")
        {
            return true;
        }
    }
    return false;
};

ValidationHelper.isFraction=function(value) {
    if (isNaN(value)) {
        let split = value.split('/');
        return split.length == 2 && !isNaN(split[0]) && !isNaN(split[1]) && parseInt(split[1]) != 0;
    }
    return false;
};

ValidationHelper.decimalPrecisionValidator=function(input, precision) {
    let pattern = new RegExp("^-?[0-9]+(\.([0-9]{" + precision + "})?)?$");
    if(input instanceof Array){
        let error = true;
        for(let i=0;i<input.length;i++){
            if(pattern.test(input[i]) == false) {
                error = false;
                break;
            }                    
        }
        return error;
    } else {
        return pattern.test(input);
    }
    
};

ValidationHelper.fileExtensionValidator=function(input, allowedFiles) {
    let regex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(" + allowedFiles.join('|') + ")$");
    return regex.test(input);
};

ValidationHelper.dateRangeValidator=function(input, format, min, max, minInclusive, maxInclusive) {
    if (!min && !max) {
        return true;
    }
    let inputDate = moment(input, format);
    let minDate = moment(min, format);
    let maxDate = moment(max, format);

    if (inputDate.isValid()) {
        if (minDate.isValid() && maxDate.isValid()) {
            let _isMinValid = minInclusive ? inputDate >= minDate : inputDate > minDate;
            let _isMaxValid = maxInclusive ? inputDate <= maxDate : inputDate < maxDate;
            return _isMinValid && _isMaxValid;
        } else if (minDate.isValid()) {
            return minInclusive ? inputDate >= minDate : inputDate > minDate;
        } else if (maxDate.isValid()) {
            return maxInclusive ? inputDate <= maxDate : inputDate < maxDate;
        }
    } else {
        return false;
    }
};

ValidationHelper.dateTimeValidator=function(input, type, format) {
     if(!format)
     {
         format = type == "datetime" ? "MM/DD/YYYY hh:mm:ss A" : "MM/DD/YYYY"; 
     }
     let inputDate = moment(input, format, true);

     if(inputDate.isValid())
     {
         return true;
     }

     return false;
};

ValidationHelper.getDateByFormat=function(datevalue, dateFormat) {
    if (typeof datevalue == "string") {
        return datevalue;
    }
    return moment(datevalue).format(dateFormat);
};
