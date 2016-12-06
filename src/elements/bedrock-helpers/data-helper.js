DataHelper = {};

(function(){
    DataHelper.cloneObject = function(o) {
        return JSON.parse(JSON.stringify(o));
    };

    DataHelper.transformAttributeToUIFormat = function(attributes, attributeModels, locale, time, source) {
        var attributesData = [];
        for(var attributeGroupName in attributeModels) {
            var attributeGroupJSON = {"name": attributeGroupName, "longName": attributeModels[attributeGroupName].longName, attributes: []};
            for(var attributeModelName in attributeModels[attributeGroupName]) {
                var attributeJSON;
                var attributeModel = attributeModels[attributeGroupName][attributeModelName];
                if(attributeModel.name) {
                    var attribute = attributes[attributeModel.name];
                    if(attribute && attribute.values) {
                        attributeJSON = this._getCurrentValue(attribute.values, locale, time, source);
                    }
                    if(attributeJSON == undefined) {
                        attributeJSON = this._getEmptyValue(locale, time, source);
                    }
                    attributeJSON.name = attributeModel.name;
                    attributeGroupJSON.attributes.push(attributeJSON);
                }   
            }
            attributesData.push(attributeGroupJSON);
        }
        //console.log(attributesData);
        return attributesData;
    };
    DataHelper._getCurrentValue = function(values, locale, time, source) {
        var value;
        if(values) {
            for(var i=0;i<values.length;i++) {
                var currentValue = values[i];
                if(currentValue.locale && currentValue.locale != locale) {
                    continue;
                }
                if(currentValue.source && currentValue.source != source) {
                    continue;
                }
                value = this.cloneObject(currentValue);
            }
        }
        return value;
    };
    DataHelper._getEmptyValue = function(locale, time, source) {
        return {
            "value": "",
            "locale": locale,
            "time": time,
            "source": source
        };
    };
})();