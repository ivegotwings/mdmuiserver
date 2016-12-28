function requiredValidator(input) {
    return (input !=undefined && input !="") ;
}
function minLengthValidator (input,length) {
    return input.length>= length;
}
function maxLengthValidator (input,length) {
    return input.length<= length;
}
function numberRangeValidator(value,min,max) {
    if(isNaN(value)){
        if(isFraction(value)){
            var split = value.split('/');
            if(!isNaN(split[0]) && !isNaN(split[1])){
                value=parseInt(split[0])/parseInt(split[1]);
            }
        } else{
            return false;
        }
    }
    if(isNaN(min)){
        return value<Number(max);
    } else if(isNaN(max)){
        return value>Number(min);
    }
    return value>Number(min) && value< Number(max);
}
function emailValidator(input) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(input);
}
function regexValidator(input,pattern) {
    var regExp= new RegExp(pattern);
    return regExp.test(input);
}
function isFraction(value){
    if(isNaN(value)){
        var split = value.split('/');
        return split.length == 2 && !isNaN(split[0]) && !isNaN(split[1]) && parseInt(split[1]) != 0;
    }
    return false;
}
function decimalPrecisionValidator(input, precision) {
    var pattern =new RegExp("^-?[0-9]+(\.([0-9]{1,"+precision+"})?)?$");
    return pattern.test(input);
}

function fileExtensionValidator(input, allowedFiles) {
    var regex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(" + allowedFiles.join('|') + ")$");
    return regex.test(input);
}

function dateRangeValidator(input, format, min, max){
    var inputDate=moment(input,format);
    var minDate=moment(min,format);
    var maxDate=moment(max,format);

    if(inputDate.isValid()){
        if(minDate.isValid() && maxDate.isValid()){
            return inputDate>minDate && inputDate < maxDate;
        } else if(minDate.isValid()){
            return inputDate>minDate;
        } else if(maxDate.isValid()){
            return inputDate<maxDate;
        }
    } else{
        return false;
    }
}
