/*
`bedrock-helpers` Represents a bunch of helpers that any bedrock, pebble, rock or app can use. 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
window.FormatHelper = window.FormatHelper || {};

FormatHelper.convertFromISODateTime = function(date, dataType, format){
   dataType = dataType.toLowerCase();

   if( date && 
      (dataType == "datetime" || dataType == "date"))
   {
       let isoFormat = dataType == "datetime" ? FormatHelper.getISODateTimeFormat(date) : "YYYY-MM-DD";

       if(!format)
       {
           format = dataType == "datetime" ? "MM/DD/YYYY hh:mm:ss A" : "MM/DD/YYYY";
       }

       let _convertedDate = moment(date.toString().toUpperCase(), isoFormat, true).format(format);

       if(_convertedDate == "Invalid date")
       {
           return date;
       }

       return _convertedDate;
   }
};

FormatHelper.checkTrueBooleanVal = function(value, trueText, falseText){
    if(value == trueText || value == falseText) {
     return value== trueText? "true":"false";

    }
 return value;
};


FormatHelper.convertFromISODateTimeToClientFormat = function(date, dataType, format){
    dataType = dataType.toLowerCase();

    if( date && 
       (dataType == "datetime" || dataType == "date"))
    {
        //var isoFormat = dataType == "datetime" ? FormatHelper.getISODateTimeFormat(date) : "YYYY-MM-DD";

        if(!format)
        {
            format = dataType == "datetime" ? "MM/DD/YYYY hh:mm:ss A" : "MM/DD/YYYY";
        }

        let _convertedDate = moment(date.toString().toUpperCase()).format(format);

        if(_convertedDate == "Invalid date")
        {
            return date;
        }

        return _convertedDate;
    }
};

FormatHelper.getISODateTimeFormat = function(isoDate) {
     // Default format & offset
     let format = "YYYY-MM-DDTHH:mm:ss.SSS";
     let offset = "-0500";
     if(isoDate) {
         let date = isoDate.toString().toUpperCase();
         let dateWithoutOffset = date.substring(0, date.length - offset.length);
         let dateOffset = date.substring(date.length - offset.length, date.length);
         if(moment(dateWithoutOffset, format, true).isValid()) {
             return format + dateOffset;
         }
     }
     return format + offset;
};
