/*
`bedrock-helpers` Represents a bunch of helpers that any bedrock, pebble, rock or app can use. 
*/
/*<script type="text/javascript" src="data-helper.js" />*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import './context-helper.js';

import './entity-helper.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
import '../bedrock-externalref-underscore/bedrock-externalref-underscore.js';
import '../bedrock-internalref-dataobject-falcor-util/bedrock-internalref-dataobject-falcor-util.js';
window.DataHelper = window.DataHelper || {};

DataHelper.FALLBACK_PATH_DELIMITER = ">>";

DataHelper.getStateFromQueryParams = function (parseTwice) {
    let search = parseTwice ? decodeURIComponent(window.location.search) : window.location.search;
    try {
        let state = JSON.parse(decodeURIComponent(search.replace(new RegExp(
            "^(?:.*[&\\?]" +
            encodeURIComponent("state").replace(/[\.\+\*]/g, "\\$&") +
            "(?:\\=([^&]*))?)?.*$", "i"), "$1")));
        if (typeof state !== "object" || Array.isArray(state)) {
            throw new Error('Expecting Object for a State');
        }
        return state;
    } catch (error) {
        return {
            error: error.message
        };
    }
};

DataHelper.cloneObject = function (o) {
    return RUFUtilities.datahelpers.clone(o);
};

DataHelper.areEqualArrays = function (array1, array2) {
    if(!array1 && !array2) {
        return true;
    } else if (!array1 || !array2) {
        return false;
    }

    let arrayUtil1 = DataHelper.cloneObject(array1);
    let arrayUtil2 = DataHelper.cloneObject(array2);
    let arrayUtil3 = DataHelper.cloneObject(array2);
    if (arrayUtil1.length != arrayUtil2.length) {
        return false;
    } else {
        for (let i = 0; i < arrayUtil1.length; i++) {
            let obj1 = arrayUtil1[i];
            for (let j = 0; j < arrayUtil2.length; j++) {
                let obj2 = arrayUtil2[j];
                if (DataHelper.compareObjects(obj1, obj2)) {
                    arrayUtil3.splice(arrayUtil3.indexOf(obj2), 1);
                    break;
                }
            }
            continue;
        }
        if (arrayUtil3.length == 0) {
            return true;
        } else {
            return false;
        }
    }
};

DataHelper.toStr = function (obj) {
    if (obj && typeof obj == "string") {
        return obj.toString();
    } else {
        return JSON.stringify(obj);
    }
};

DataHelper.findEntityById = function (entitiesExternalFormat, entityId) {
    if (entitiesExternalFormat && entitiesExternalFormat.length) {
        for (let i = 0; i < entitiesExternalFormat.length; i++) {
            let entity = entitiesExternalFormat[i];
            if (entityId == entity.id) {
                return entity;
            }
        }
    }
    return {};
};

DataHelper.compareObjects = function (firstObject, secondObject) {
    if (_.isEmpty(firstObject) && _.isEmpty(secondObject)) {
        return true;
    } else if (_.isEmpty(firstObject) || _.isEmpty(secondObject)) {
        return false;
    }
    // Create arrays of property names
    let firstObjectProps = Object.getOwnPropertyNames(firstObject);
    let secondObjectProps = Object.getOwnPropertyNames(secondObject);

    // If number of properties is different,
    // objects are not equivalent
    if (firstObjectProps.length != secondObjectProps.length) {
        return false;
    }

    for (let i = 0; i < firstObjectProps.length; i++) {
        let propName = firstObjectProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (typeof firstObject[propName] === typeof secondObject[propName]) {
            if (typeof firstObject[propName] === "object") {
                if (!DataHelper.compareObjects(firstObject[propName], secondObject[propName])) {
                    return false;
                }
            } else if (firstObject[propName] instanceof Array) {
                if (!DataHelper.areEqualArrays(firstObject[propName], secondObject[propName])) {
                    return false;
                }
            } else if (firstObject[propName] !== secondObject[propName]) {
                return false;
            }
        } else {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
};

DataHelper.applyLocalFilterByBoolean = function(recordsToBeFiltered,booleanValue,fieldName) {
    return recordsToBeFiltered.filter(function(record) { 
        if(record.hasOwnProperty(fieldName)){
           return Boolean(record[fieldName]) === booleanValue;
        }
    });
}
DataHelper.applyLocalFilter = function(recordsToBeFiltered,filterText,fieldsToConsider) {
    if (!recordsToBeFiltered) {
        return recordsToBeFiltered;
    }
    filterText = filterText.toLowerCase();
    let prefix = /^\"/i;
    let suffix = /^.+\"$/gm;
    let isPrefixed = prefix.test(filterText);
    let isSuffixed = suffix.test(filterText);
    let isExactSearch = false;
    if (isPrefixed && isSuffixed) {
        isExactSearch = true;
        filterText = filterText.replace(/(^")|("$)/g, "")
    }else{
        filterText = DataHelper.removeSpecialCharacters(filterText);
    }
    return recordsToBeFiltered.filter((function (record) {
        let itemFound = false;
        for(let field=0;field < fieldsToConsider.length;field++){
            let _currentField = fieldsToConsider[field];
            let itemFieldValue = DataHelper.getItemFieldValue(record,_currentField).toString().toLowerCase();
            if(!_.isEmpty(itemFieldValue)){
                if(isExactSearch){
                    if(filterText == itemFieldValue){
                        itemFound = true;
                        break;
                    }
                }else{
                    let filterTextItems = filterText.split(" ");
                    itemFound = filterTextItems.every(value => {
                        itemFieldValue = DataHelper.removeSpecialCharacters(itemFieldValue)
                        let currentFieldValueIndex = itemFieldValue.indexOf(value);
                        if(currentFieldValueIndex > -1){
                            if(currentFieldValueIndex == 0 || currentFieldValueIndex  > 0 && itemFieldValue.charAt(currentFieldValueIndex - 1) ==  " " ){
                                return true;
                            }
                        }
                    });
                }
                if(itemFound){
                    break;
                }
            }
        }
        return itemFound;
    }))
}
DataHelper.getItemFieldValue = function(item,field) {
    let fieldValue = item[field];
    if (_.isEmpty(fieldValue)) {
        fieldValue = '';
    }
    return fieldValue;
}

DataHelper.containsObject = function (obj, list) {
    let res = _.find(list, function (val) {
        return _.isEqual(obj, val)
    });

    return (_.isObject(res)) ? true : false;
};

DataHelper.isValidObjectPath = function (base, path) {
    let current = base;
    let components = path.split(".");
    for (let i = 0; i < components.length; i++) {
        if ((typeof current !== "object") || !current || !(components[i] in current)) {
            return false;
        }
        current = current[components[i]];
    }
    return true;
};

DataHelper.getParamValue = function (param) {
    let mainApp = RUFUtilities.mainApp;
    if (mainApp && mainApp.pageRoute && mainApp.pageRoute.__queryParams && param in mainApp.pageRoute
        .__queryParams) {
        let paramValue = mainApp.pageRoute.__queryParams[param];
        if (paramValue) {
            return decodeURIComponent(paramValue);
        }
    }
};

DataHelper._isEqual = function (stooge, clone) {
    return _.isEqual(stooge, clone);
};

DataHelper._findItemByKeyValue = function (array, key, value) {
    let elementToReturn = _.filter(array, function (currentElement) {
        if (currentElement[key] === value) {
            return currentElement;
        }
    });

    return elementToReturn[0];
};

DataHelper.getValue = function (obj, key) {
    let outputObj = {};
    for (let i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (i == key) {
            return obj[i];
        } else if (typeof obj[i] == 'object') {
            outputObj = DataHelper.getValue(obj[i], key);
        }
    }
    return outputObj;
};

DataHelper.validateGetEntitiesResponse = function (entitiesResponse) {
    if (entitiesResponse && entitiesResponse.content && entitiesResponse.content.entities &&
        !_.isEmpty(entitiesResponse.content.entities)) {

        return true;
    }
    return false;
};

DataHelper.validateGetModelsResponse = function (modelsResponse) {
    if (modelsResponse && modelsResponse.content &&
        modelsResponse.content.entityModels && modelsResponse.content.entityModels
        .length >
        0) {

        return true;
    }
    return false;
};

DataHelper.validateGetAttributeModelsResponse_New = function (attributeModelsResponsee) {
    if (attributeModelsResponsee && attributeModelsResponsee.content &&
        attributeModelsResponsee.content.entityModels && attributeModelsResponsee.content.entityModels.length >
        0 && !_.isEmpty(attributeModelsResponsee.content.entityModels[0])) {
        return true;
    }
    return false;
};

DataHelper.oneTimeEvent = function (element, type, callback) {
    let eventName = "event-" + type + "-added";
    let eventCallbackName = "event-" + type;
    if (element.hasAttribute(eventName)) {
        element.removeEventListener(type, element[eventCallbackName]);
        delete element[eventCallbackName];
    }
    element.setAttribute(eventName, true);
    element[eventCallbackName] = callback;
    element.addEventListener(type, callback);
};

DataHelper.getDefaultLocale = function () {
    let tenantSettings = RUFBehaviors.SettingsBehavior.appSetting('tenantSettings');
    let defaultLocale = "en-US";
    if (tenantSettings && tenantSettings.defaultValueLocale) {
        defaultLocale = tenantSettings.defaultValueLocale;
    }
    return defaultLocale;
};

DataHelper.getDefaultSource = function () {
    let tenantSettings = RUFBehaviors.SettingsBehavior.appSetting("tenantSettings");
    let defaultSource = "internal";
    if (tenantSettings && tenantSettings.defaultValueSource) {
        defaultSource = tenantSettings.defaultValueSource;
    }
    return defaultSource;
};

DataHelper.getDefaultValContext = function () {
    let defaultSource = DataHelper.getDefaultSource();
    let defaultLocale = DataHelper.getDefaultLocale();
    return {
        "source": defaultSource,
        "locale": defaultLocale
    };
};

DataHelper.getTenantId = function () {
    let tenantId = 'rdw';
    let mainApp = RUFUtilities.mainApp;
    if (mainApp && mainApp.tenantId) {
        tenantId = mainApp.tenantId;
    }

    return tenantId;
};

DataHelper.getUserId = function () {
    let userId = 'admin';
    let mainApp = RUFUtilities.mainApp;
    if (mainApp && mainApp.userId) {
        userId = mainApp.userId;
    }

    return userId;
};

DataHelper.getUserName = function () {
    let userName = 'admin';
    let userId = DataHelper.getUserId();
    if (userId) {
        userName = userId.replace(/_user$/, "");
    }
    return userName;
};

DataHelper.getUserRoles = function () {
    let userRoles;
    let mainApp = RUFUtilities.mainApp;
    if (mainApp && mainApp.roles) {
        userRoles = mainApp.roles;
    }

    return userRoles;
};

DataHelper.arrayRemove = function (arr, val) {
    let index = -1;
    index = arr.indexOf(val);
    while (index >= 0) {
        arr.splice(index, 1);
        index = arr.indexOf(val);
    }
};

DataHelper.getRelToNames = function (relationships) {
    if (relationships && relationships.length > 0) {
        let relToNames = [];
        for (let i = 0; i < relationships.length; i++) {
            if (relationships[i].relTo) {
                let relToName = relationships[i].relTo.id.replace("_" + relationships[i].relTo.type, "");
                relToNames.push(relToName);
            }
        }
        return relToNames;
    }
};

DataHelper.getRandomString = function () {
    let x = 2147483648;
    return Math.floor(Math.random() * x).toString(36) +
        Math.abs(Math.floor(Math.random() * x) ^ new Date().getTime()).toString(36);
};

/*
    Sort the object data based on keys or values
    obj - source object
    sortProperties - is an array, user can provide value object deep path. default is key sorting.
                     Eg: ["properties.rank", "properties.groupName"]
    keyIdentifier - Object key converts to the value property while sorting,
                    this is to retain the object after sorting
*/
DataHelper.sortObject = function (obj, sortProperties, orderBy = "asc", keyIdentifier = "keyIdentifier") {
    let objArray = _.map(obj, function (value, key) {
        if (!(value instanceof Object)) {
            value = {};
        }
        value[keyIdentifier] = key;
        return value
    });
    if (_.isEmpty(sortProperties)) {
        sortProperties = [keyIdentifier];
    }
    let sortedObjArray = _.sortBy(objArray, function (item) {
        let properties = sortProperties.map(path => {
            if (DataHelper.isValidObjectPath(item, path)) {
                return eval("item." + path);
            } else {
                return undefined;
            }
        });
        return properties;
    });
    if (orderBy != "asc") {
        sortedObjArray = sortedObjArray.reverse();
    }
    let resultObj = {};
    sortedObjArray.forEach(item => {
        let key = item[keyIdentifier];
        resultObj[key] = item;
        delete item[keyIdentifier];
        if (_.isEmpty(resultObj[key])) {
            resultObj[key] = obj[key];
        }
    })
    return resultObj;
};

DataHelper.sort = function (arrayOfObjects, sortByProperty, dataType, sortType, sortByAdditionalProperties) {
    let sortedData = arrayOfObjects;
    if (arrayOfObjects && sortByProperty) {

        if (dataType == "integer" || dataType == "decimal") {
            this._assignDefaultForNumericSort(arrayOfObjects, sortByProperty, sortType);
        }

        sortedData = arrayOfObjects.sort(function (item1, item2) {
            let sortResult = DataHelper._applySort(item1, item2, sortByProperty, dataType,
                sortType);

            if (sortResult == 0 && sortByAdditionalProperties && sortByAdditionalProperties.length >
                0) {
                return DataHelper._applyMultiSort(item1, item2, sortType,
                    sortByAdditionalProperties);
            } else {
                return sortResult;
            }
        });
        if (dataType == "integer" || dataType == "decimal") {
            this._removeDefaultForNumericSort(sortedData, sortByProperty, sortType);
        }
    }

    return sortedData;
};

DataHelper._applySort = function (item1, item2, property, dataType, sortType) {
    let firstItem, secondItem;
    let item1Value = item1[property];
    let item2Value = item2[property];
    if (item1Value == undefined && DataHelper.isValidObjectPath(item1, "data.attributes")) {
        item1Value = AttributeHelper.getFirstAttributeValue(item1.data.attributes[property])
    };
    if (item2Value == undefined && DataHelper.isValidObjectPath(item2, "data.attributes")) {
        item2Value = AttributeHelper.getFirstAttributeValue(item2.data.attributes[property])
    };
    if (dataType == "date" || dataType == "datetime") {
        firstItem = item1Value ? new Date(item1Value) : "";
        secondItem = item2Value ? new Date(item2Value) : "";
    } else if (dataType == "integer" || dataType == "decimal") {
        firstItem = item1Value ? parseFloat(item1Value) : "";
        secondItem = item2Value ? parseFloat(item2Value) : "";
    } else {
        firstItem = item1Value ? item1Value.toString().toLowerCase() : "";
        secondItem = item2Value ? item2Value.toString().toLowerCase() : "";
    }

    if (sortType == "desc") {
        if (firstItem < secondItem) return 1;
        if (firstItem > secondItem) return -1;
    } else {
        if (firstItem > secondItem) return 1;
        if (firstItem < secondItem) return -1;
    }

    return 0;
};

DataHelper._applyMultiSort = function (item1, item2, sortType, sortByAdditionalProperties) {
    if (!sortByAdditionalProperties || sortByAdditionalProperties.length == 0) {
        return 0;
    }

    for (let i = 0; i < sortByAdditionalProperties.length; i++) {
        let _sortType = sortByAdditionalProperties[i].sortType ? sortByAdditionalProperties[i].sortType :
            sortType;
        let sortResult = this._applySort(item1, item2, sortByAdditionalProperties[i].name,
            sortByAdditionalProperties[i].dataType, _sortType);

        if (sortResult == 0) {
            continue;
        } else {
            return sortResult;
        }
    }

    return 0;
};

DataHelper._assignDefaultForNumericSort = function (arrayOfObjects, property, sortType) {
    let defaultValue = sortType == "desc" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    for (let i = 0; i < arrayOfObjects.length; i++) {
        if (!arrayOfObjects[i][property]) {
            arrayOfObjects[i][property] = defaultValue;
        }
    }
};

DataHelper._removeDefaultForNumericSort = function (arrayOfObjects, property, sortType) {
    for (let i = 0; i < arrayOfObjects.length; i++) {
        if ((arrayOfObjects[i][property] == Number.POSITIVE_INFINITY) ||
            (arrayOfObjects[i][property] == Number.NEGATIVE_INFINITY)) {
            arrayOfObjects[i][property] = "";
        }
    }
};

DataHelper.readAttributeFromPath = function (word) {
    if (DataHelper.isEmptyObject(word)) {
        return word;
    }

    if (word.indexOf("entity.name") >= 0 || word.indexOf("entity.id") >= 0 || word.indexOf(
            "entity.domain") >= 0) {
        return word.replace("entity.", "");
    } else {
        return word.replace("entity.attributes.", "");
    }
}
DataHelper.prepareTitleByPattern = function (item, pattern) {
    if (pattern) {
        let regex = /{(.+?)}/g;
        let attributesWithCurly = pattern.match(regex) || [];
        let titleField, attributeWithCurly,attributeValue;
        for (let i = attributesWithCurly.length; i >= 0; i--) {
            attributeWithCurly = attributesWithCurly[i]
            if (attributeWithCurly) {
                titleField = DataHelper.getAttributesBetweenCurlies(attributeWithCurly);
                attributeValue = item[titleField] ? item[titleField] : "";
                if (_.isEmpty(attributeValue)) {
                    pattern = DataHelper._removeLeadingCharsForEmptyCurlies(pattern);
                }
                pattern = pattern.replace(attributeWithCurly, attributeValue)
            }
        }               
        return DataHelper._removeLeadingSpecialChars(pattern);
    }
}
DataHelper._removeLeadingSpecialChars = function (pattern) {
    let resultPattern = pattern;
    if (pattern) {
        let isSpecialCharacter;               
        for (let i = 0; i <= pattern.length; i++) {
            isSpecialCharacter = !(/[A-Za-z0-9]+/g).test(pattern[i]);
            if (isSpecialCharacter) {
                resultPattern = pattern.substr(i + 1);
            } else {
                break;
            }
        }
    }
    return resultPattern;
}
DataHelper._removeLeadingCharsForEmptyCurlies = function (pattern) {
    let lastIndex = pattern.lastIndexOf("}");
    let secondLastIndex = pattern.lastIndexOf("}", lastIndex - 1);
    if (secondLastIndex < 0) {
        pattern = pattern.slice(0, 0) + pattern.slice(lastIndex + 1);
    } else {
        pattern = pattern.slice(0, secondLastIndex) + pattern.slice(lastIndex);
    }
    return pattern;
}
DataHelper.getWordsBetweenCurlies = function (str) {
    let results = [],
        re = /{([^}]+)}/g,
        text;

    // eslint-disable-next-line no-cond-assign
    while (text = re.exec(str)) {
        results.push(text[1]);
    }
    return results;
}

DataHelper.getAttributesBetweenCurlies = function (fieldPattern) {
    let attributeNames = [];

    let attributesWithPattern = DataHelper.getWordsBetweenCurlies(fieldPattern);
    if (!DataHelper.isEmptyObject(attributesWithPattern) && attributesWithPattern instanceof Array) {
        for (let j = 0; j < attributesWithPattern.length; j++) {
            let attributeWithPattern = attributesWithPattern[j];
            attributeNames.push(DataHelper.readAttributeFromPath(attributeWithPattern));
        }
    }

    return attributeNames;
}

DataHelper.isEmptyObject = function (obj) {
    return _.isEmpty(obj);
}

DataHelper.validateAndGetResponseContent = function (responsePkg) {
    // If response package has an issue it should return false
    if (typeof (responsePkg) !== "undefined" && responsePkg.status == "success") {
        return responsePkg.content;
    } else {
        return false;
    }
}

DataHelper.validateAndFillProfile = function (config, id, context) {
    context.app = "RSConnect";
    if (config) {
        if (config.data) {
            if (config.data.contexts && config.data.contexts.length > 0) {
                if (!config.data.contexts[0].context) {
                    config.data.contexts[0].context = context;
                }
                if (config.data.contexts[0].jsonData) {
                    if (config.data.contexts[0].jsonData.fieldOverrides) {
                        return config;
                    } else {
                        config.data.contexts[0].jsonData.fieldOverrides = [];
                        return config;
                    }
                } else {
                    config.data.contexts[0].jsonData = {
                        "fieldOverrides": []
                    };
                    return config;
                }
            } else {
                config.data.contexts = [{
                    "context": context,
                    "jsonData": {
                        "fieldOverrides": []
                    }
                }];
                return config;
            }
        } else {
            config.data = {
                "contexts": [{
                    "context": context,
                    "jsonData": {
                        "fieldOverrides": []
                    }
                }]
            };
            return config;
        }
    } else {
        config = {
            "id": id,
            "name": id,
            "type": "overrides",
            "data": {
                "contexts": [{
                    "context": context,
                    "jsonData": {
                        "fieldOverrides": []
                    }
                }]
            }
        };
        return config;
    }
};

DataHelper.validateAndGetConfigObjects = function (response) {
    if (response && response.status && response.status.toLowerCase() == "success" && response.content &&
        response.content.configObjects) {
        return response.content.configObjects;
    }
};

DataHelper.validateAndGetMessage = function (response) {
    let message = "";
    //from transform, fieldMap API response.response, from process API response.dataObjectOperationResponse
    if ((response && response.response && response.response.status && response.response.status.toLowerCase() ==
            "success") || (response && response.dataObjectOperationResponse && response.dataObjectOperationResponse
            .status && response.dataObjectOperationResponse.status.toLowerCase() == "success")) {
        message = "";
    }
    //if the response is from transform or fieldMap API
    else if (response && response.response && response.response.statusDetail && response.response.statusDetail
        .message) {
        message = response.response.statusDetail.message;
    }
    //if the response is from process API
    else if (response && response.dataObjectOperationResponse && response.dataObjectOperationResponse.statusDetail &&
        response.dataObjectOperationResponse.statusDetail.message) {
        message = response.dataObjectOperationResponse.statusDetail.message;
    }
    //if there is no status/statusDetail at all in response
    else {
        message = "COP service is down";
    }
    return message;
};

DataHelper.generateUUID = function () {
    let d = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};

// JSFiddle: http://jsfiddle.net/9Q23E/527/
DataHelper.isTextSelected = function (input) {
    let text = this.getSelectedText(input);
    if (text && text.trim().length > 0) {
        return true;
    } else {
        return false
    }
}

DataHelper.getSelectedText = function (textBox) {
    let selectedText = "";

    // all browsers (including IE9 and up), except IE before version 9 
    if (textBox && (textBox.tagName.toLowerCase() == "textarea" || (textBox.tagName.toLowerCase() ==
            "input" && textBox.type.toLowerCase() == "text"))) {
        let startIndex = textBox.selectionStart;
        let endIndex = textBox.selectionEnd;

        if (endIndex - startIndex > 0) {
            selectedText = textBox.value.substring(textBox.selectionStart, textBox.selectionEnd);
        }
    }

    return selectedText;
}

DataHelper.replaceAt = function (currentString, index, stringToReplace) {
    return currentString.substr(0, index) + stringToReplace + currentString.substr(index);
}

DataHelper.getSearchCriteria = function (searchText) {
    if (searchText) {
        let isIdSearch = false;
        let prefix = /^id:/i;
        if (prefix.test(searchText)) {
            isIdSearch = true;
        }

        if (isIdSearch) {
            searchText = searchText.replace(prefix, '');
            let idList = searchText.split(/ or | and |,/ig).map(function (item) {
                return item.replace(/'|"/g, '').trim();
            });
            return {
                "isIdSearch": true,
                "ids": idList
            };
        } else {
            let keywordsCriterion = DataHelper.prepareKeywordsCriteria(searchText)

            return keywordsCriterion;
        }
    }
};

DataHelper.prepareKeywordsCriteria = function(searchText) {
    if (searchText) {
        let keywordsCriterion = {};
        let searchObj = DataHelper.getSearchTextCharacteristics(searchText)
        let isExactSearch = searchObj["isExactSearch"];
        let updatedSearchText = searchObj["updatedSearchText"];
        
        if(isExactSearch){
            updatedSearchText = '"' + updatedSearchText.join('" "') + '"';
        } else {
            updatedSearchText = updatedSearchText.join(' ');
            updatedSearchText = DataHelper.removeSpecialCharacters(updatedSearchText);
            updatedSearchText = DataHelper.populateWildcardForFilterText(updatedSearchText);
        }

        keywordsCriterion.keywords = updatedSearchText;
        keywordsCriterion.operator = searchObj["operator"];
        return keywordsCriterion;
    }
  }

DataHelper.removeSpecialCharacters = function(text){
    // replace all non supporting chars with space.
     // replace leading and traiiling . ' : (not supprting in leading and trailling position) with space. 
     // replace all extra space with single space.
     text = text.replace(/[\(\)\[\]{}&@₹#$\-\|~!%^*=+/;,<>?\\"]/g," ").replace(/(^[.\s]+)|(^['\s]+)|(^[:\s]+)|([.\s]+$)|([:\s]+$)|(['\s]+$)/g, "").replace(/  +/g, ' ').trim(); 
     return text;
}

DataHelper.getSearchTextCharacteristics = function(searchText){
    let searchTextCharacteristics = {};
    let prefix = /^\"/i;
    let suffix = /^.+\"$/gm;
    let isPrefixed = prefix.test(searchText);
    let isSuffixed = suffix.test(searchText);
    let operator = "_AND";
    let searchTextsByAndSplit;
    let searchTextsByOrSplit;
    let searchTextsAfterSplit;
    let updatedSearchText = [];
    let isExactSearch = false;
    
    if(isPrefixed && isSuffixed){
        isExactSearch = true;

        searchTextsByAndSplit = searchText.toLowerCase().split("\" and \"");
        searchTextsByOrSplit = searchText.toLowerCase().split("\" or \"");
    } else {
        isExactSearch = false;

        searchTextsByAndSplit = searchText.toLowerCase().split("' and '");
        searchTextsByOrSplit = searchText.toLowerCase().split("' or '");
    }

    if (searchTextsByAndSplit.length > 1) {
        operator = "_AND";
        searchTextsAfterSplit = searchTextsByAndSplit;
    } else if (searchTextsByOrSplit.length > 1) {
        operator = "_OR";
        searchTextsAfterSplit = searchTextsByOrSplit;
    } else {
        searchTextsAfterSplit = [searchText];
    }

    if(isExactSearch) {
        searchTextsAfterSplit.forEach(text => {
            updatedSearchText.push(DataHelper.replaceDoubleQuotesWithSpace(text));
        });
    } else {
        updatedSearchText = searchTextsAfterSplit;
    }

    searchTextCharacteristics["isExactSearch"] = isExactSearch;
    searchTextCharacteristics["updatedSearchText"]  = updatedSearchText;
    searchTextCharacteristics["operator"] = operator;

    return searchTextCharacteristics;
}

DataHelper.replaceDoubleQuotesWithSpace = function(value){
    if(value instanceof Array){
        let _modifiedArray = [];
        value.forEach(val =>{
            _modifiedArray.push(val.replace(/"/g, " ").replace(/  +/g, ' ').trim());
        });
        return _modifiedArray;
    }else{
        return value.replace(/"/g, " ").replace(/  +/g, ' ').trim();
    }
}

DataHelper.populateWildcardForFilterText  = function(value){
    let _value = value.split(" ");
    let modifiedValue = [];
    _value.forEach((val) =>{
        if(!_.isEmpty(val)){
            modifiedValue.push(val + "*");
        }
    });
    return modifiedValue.join(" ");
}

DataHelper.isHotlineModeEnabled = function () {
    let mainApp = RUFUtilities.mainApp;
    if (mainApp && mainApp.hotlineModeEnabled) {
        return true;
    }
    return false;
};

DataHelper.getDependentAttributeModels = function (attributeModels, dependentAttributeModels,
    currentAttributeModel) {
    if (attributeModels) {
        let dependentAttributesNames = [];
        let dependentAttributesToReturn = {};

        if (_.isEmpty(dependentAttributeModels)) {
            dependentAttributeModels = attributeModels;
        }

        if (!_.isEmpty(attributeModels)) {
            Object.keys(attributeModels).map(function (attributeModel) {
                if (attributeModel === currentAttributeModel.name) {
                    if (attributeModels[attributeModel]) {
                        let attributeModelProperties = attributeModels[attributeModel];
                        if (attributeModelProperties) {
                            if (attributeModelProperties.dataType.toLowerCase() === "nested" &&
                                !_.isEmpty(attributeModelProperties.group)) {
                                let childAttributeModels = attributeModelProperties.group[0];
                                for (let childAttributeName in childAttributeModels) {
                                    let currentChildAttributeModel = childAttributeModels[
                                        childAttributeName];
                                    let childDependentAttributes = DataHelper.getDependentAttributeModels(
                                        childAttributeModels, dependentAttributeModels,
                                        currentChildAttributeModel);
                                    if (!_.isEmpty(childDependentAttributes)) {
                                        Object.keys(childDependentAttributes).forEach(function (
                                            attributeName) {
                                            if (!dependentAttributesToReturn[
                                                    attributeName]) {
                                                dependentAttributesToReturn[
                                                        attributeName] =
                                                    childDependentAttributes[
                                                        attributeName];
                                            }
                                        }, this);
                                    }
                                }
                            } else {
                                let dependencyInfo = attributeModelProperties.dependencyInfo;
                                if (dependencyInfo) {
                                    for (let i = 0; i < dependencyInfo.length; i++) {
                                        dependentAttributesNames.push(dependencyInfo[i].dependentOn);
                                    }
                                }
                            }
                        }
                    }
                }
            }, this);

            for (let i = 0; i < dependentAttributesNames.length; i++) {
                Object.keys(dependentAttributeModels).map(function (attributeModel) {
                    if (attributeModel === dependentAttributesNames[i]) {
                        dependentAttributesToReturn[attributeModel] = dependentAttributeModels[
                            attributeModel];
                    }
                });
            }
        }

        return dependentAttributesToReturn;
    }
};

DataHelper.getDependentAttributesOfAttribute = function (attributeElements, attribute) {
    let dependentAttributesToReturn = [];

    for (let i = 0; i < attributeElements.length; i++) {
        let isDependentOnCurrentAttribute = false;

        let dependentAttrModels = attributeElements[i].dependentAttributeModelObjects;
        let dependentAttrObjects = attributeElements[i].dependentAttributeObjects;
        if (!_.isEmpty(dependentAttrModels)) {
            for (let attrName in dependentAttrModels) {
                if (DataHelper.compareObjects(dependentAttrModels[attrName], attribute.attributeModelObject)) {
                    dependentAttrObjects.forEach(function (element, index) {
                        if (element.name === attribute.attributeModelObject.name) {
                            dependentAttrObjects[index] = attribute.attributeObject;
                        }
                    });
                    isDependentOnCurrentAttribute = true
                    break;
                }
            }
        }

        if (isDependentOnCurrentAttribute) {
            dependentAttributesToReturn.push(attributeElements[i]);
        }
    }

    return dependentAttributesToReturn;
};

DataHelper.updateDependentAttributeElements = function (dependentAttributeElements, currentAttribute,
    isRevertButtonClicked) {
    for (let i = 0; i < dependentAttributeElements.length; i++) {
        let dependentAttributeElement = dependentAttributeElements[i];
        if (dependentAttributeElement.attributeModelObject.dataType.toLowerCase() === "nested") {
            let nestedAttributeGrid = dependentAttributeElement.shadowRoot.querySelector(
                "rock-nested-attribute-grid");
            if (nestedAttributeGrid) {
                let nestedChildAttributeElements = nestedAttributeGrid.getChildAttributeElements();
                if (!_.isEmpty(nestedChildAttributeElements)) {
                    let dependentChildAttributeElements = DataHelper.getDependentAttributesOfAttribute(
                        nestedChildAttributeElements, currentAttribute);
                    if (!_.isEmpty(dependentChildAttributeElements)) {
                        DataHelper.updateDependentAttributeElements(dependentChildAttributeElements,
                            currentAttribute, isRevertButtonClicked);
                    }
                }
                nestedAttributeGrid.updateAttributeErrors();
            }
        } else {
            let dependentAttributeObjects = dependentAttributeElement.dependentAttributeObjects;
            dependentAttributeElement.dependentAttributeObjects = [];
            dependentAttributeElement.dependentAttributeObjects = dependentAttributeObjects;

            if (dependentAttributeElement.attributeObject.value.length > 0) {
                dependentAttributeElement.invalid = true;
                let errorMessage = "These value(s) may be invalid now, as the value of " +
                    currentAttribute
                    .attributeModelObject.externalName + " is changed. Select a new value.";
                dependentAttributeElement.addValidationMessages(errorMessage, false);
            }

            if (isRevertButtonClicked && dependentAttributeElement.validationWarnings &&
                dependentAttributeElement.validationWarnings.length > 0) {
                let indexToRemove = -1;
                dependentAttributeElement.validationWarnings.forEach(function (currentError, index) {
                    if (currentError.includes(currentAttribute.attributeModelObject.externalName)) {
                        indexToRemove = index;
                        return;
                    }
                });
                if (indexToRemove >= 0) {
                    dependentAttributeElement.removeValidationMessagesAt(indexToRemove, false);
                }
            }
        }
    }
};

DataHelper.getFormatedSearchQuery = function (queryToFormat) {
    let seperator = " or ";
    let tempPastedQueryArray = queryToFormat.trim().split(/\n|\r/);
    let tempformatedQueryString = "";
    if (tempPastedQueryArray.length > 1) { //formating copied xls rows
        for (let i = 0; i < tempPastedQueryArray.length; i++) {
            if (tempPastedQueryArray[i].length == 1 || tempPastedQueryArray[i] == "") {
                continue; // empty cell
            }
            tempformatedQueryString = tempformatedQueryString + "\"" + tempPastedQueryArray[
                i] + "\"" + seperator;
        }
        return tempformatedQueryString.substr(0, tempformatedQueryString.lastIndexOf(
            seperator));
    } else {
        return queryToFormat;
    }
};

DataHelper.getPluralLabel = function (title) {
    let label = title;

    if (title) {
        let vowels = ["a", "e", "i", "o", "u"];
        let titleLength = title.length;


        if (title[titleLength - 1] == "y") {
            if (vowels.indexOf(title[titleLength - 2]) > -1) {
                label = title + "s";
            } else {
                label = title.substring(0, titleLength - 1) + "ies";
            }
        } else {
            label = title + "s";
        }

    }
    return label;
};

DataHelper.getExternalNameAttributeFromModel = function (model) {
    if (model.data && model.data.attributes &&
        !DataHelper.isEmptyObject(model.data.attributes) &&
        model.data.attributes instanceof Object) {
        for (let attributeName in model.data.attributes) {
            let attributeObject = model.data.attributes[attributeName];

            if (attributeObject &&
                attributeObject.properties &&
                attributeObject.properties.isExternalName) {
                return attributeName;
            }
        }
    }
};

DataHelper.getRefEntityType = function (attributeModel) {
    if (attributeModel && attributeModel.properties &&
        attributeModel.properties.isReferenceType &&
        !DataHelper.isEmptyObject(attributeModel.properties.referenceEntityInfo) &&
        attributeModel.properties.referenceEntityInfo instanceof Array) {
        for (let i = 0; i < attributeModel.properties.referenceEntityInfo.length; i++) {
            let refEntityInfo = attributeModel.properties.referenceEntityInfo[i];
            if (refEntityInfo.refRelationshipName == 'hasReferenceTo') {
                return refEntityInfo.refEntityType;
            }
        }
    }

    return undefined;
};

DataHelper.updateRefEntityInfo = function (attributeModel, referenceModels) {
    if (attributeModel && attributeModel.properties &&
        attributeModel.properties.isReferenceType &&
        !DataHelper.isEmptyObject(attributeModel.properties.referenceEntityInfo) &&
        attributeModel.properties.referenceEntityInfo instanceof Array) {
        for (let i = 0; i < attributeModel.properties.referenceEntityInfo.length; i++) {
            let refEntityInfo = attributeModel.properties.referenceEntityInfo[i];
            if (refEntityInfo.refRelationshipName == 'hasReferenceTo') {
                let refEntityType = refEntityInfo.refEntityType;

                refEntityInfo.listTitle = referenceModels[refEntityType] ? "{entity.attributes." +
                    referenceModels[refEntityType].externalNameAttribute + "}" : undefined;
                refEntityInfo.listValueAttribute = referenceModels[refEntityType] ? referenceModels[
                    refEntityType].externalNameAttribute : undefined;
            }
        }
    }
};

DataHelper.convertObjectToArray = function (obj) {
    let arr = [];
    if (!_.isEmpty(obj)) {
        for (let key in obj) {
            arr.push(obj[key]);
        }
    }
    //Sorting based on display sequence if available
    arr = _.sortBy(arr, function (item) {
        return item.displaySequence;
    })
    return arr;
};

DataHelper.getFallbackLocaleFromCoalescePath = function (path) {
    if (path) {
        let locales = path.split(">>");
        if (!this.isEmptyObject(locales)) {
            return locales[0];
        }
    }

    return undefined;
};

DataHelper.getFallbackPathsFromCoalescePath = function (path) {
    if (path) {
        return path.split(DataHelper.FALLBACK_PATH_DELIMITER);
    }

    return [];
};

DataHelper.getFallbackLocalesForLocaleAsync = async function (locale) {
    let localeManager = ComponentHelper.getLocaleManager();
    if (localeManager) {
        let localeObject = await localeManager.getByNameAsync(locale);
        if (localeObject && localeObject.fallbackLocales) {
            return localeObject.fallbackLocales;
        }
    }
}

DataHelper.buildLocaleCoalescePath = function (currentLocale, fallBackLocales, localeIndex) {
    let localeCoalescePath = "";
    for (let i = 0; i <= localeIndex; i++) {
        localeCoalescePath = localeCoalescePath + fallBackLocales[localeIndex - i].name + DataHelper.FALLBACK_PATH_DELIMITER;
    }

    localeCoalescePath = localeCoalescePath + currentLocale;

    return localeCoalescePath;
}

DataHelper.getNestedAttributeItems = function (parentItem, showNestedAttributes, showNestedChildAttributes,
    sortByProperty, parentDisplaySequence) {
    let nestedAttributes = [];
    if (showNestedAttributes) {
        nestedAttributes.push(parentItem);
    }

    if (showNestedChildAttributes) {
        let _parentItemGroup = undefined;
        if (parentItem.group && parentItem.group.length > 0) {
            _parentItemGroup = parentItem.group[0];
        }

        parentItem.title = parentItem.title ? parentItem.title : parentItem.externalName;
        if (parentItem && _parentItemGroup && parentItem.title && parentItem.name) {
            for (let key in _parentItemGroup) {
                let childItem = _parentItemGroup[key];
                childItem.title = childItem.externalName = parentItem.title + "." + childItem.externalName;
                childItem.name = parentItem.name + "." + key;
                if (childItem.dataType == "nested") {
                    if (!childItem.displaySequence) {
                        childItem.displaySequence = 999;
                    }
                    if (parentDisplaySequence) {
                        childItem.parentDisplaySequence = parentDisplaySequence + childItem.displaySequence;
                    }
                    nestedAttributes = nestedAttributes.concat(DataHelper.getNestedAttributeItems(
                        childItem, showNestedAttributes, showNestedChildAttributes,
                        sortByProperty, childItem.displaySequence));
                } else {
                    childItem["isNestedChildItem"] = true;
                    childItem.displaySequence = parentDisplaySequence ? 999 + "." +
                        parentDisplaySequence + childItem.displaySequence : 999 + "." + childItem.displaySequence;
                    nestedAttributes.push(childItem);
                }
            };
        }
    }
    nestedAttributes.sort(function (item1, item2) {
        return item1[sortByProperty] - item2[sortByProperty];
    });
    return nestedAttributes;
};

DataHelper.buildLocaleCoalescePathExternalname = function (path) {
    let coalesceExternalName = ""
    if (path) {
        if (path.indexOf(DataHelper.FALLBACK_PATH_DELIMITER) > -1) {
            let locales = path.split(DataHelper.FALLBACK_PATH_DELIMITER);
            let localeManager = ComponentHelper.getLocaleManager();
            let localeExternalName;
            if (locales && locales.length > 0) {
                for (let i = 0; i < locales.length; i++) {
                    localeExternalName = localeManager.getByName(locales[i]);
                    if (localeExternalName && localeExternalName.externalName) {
                        coalesceExternalName += localeExternalName.externalName + DataHelper.FALLBACK_PATH_DELIMITER
                    }
                }
            }
            let coalescePathLength = DataHelper.FALLBACK_PATH_DELIMITER.length;
            if (coalesceExternalName.substr(-coalescePathLength) == DataHelper.FALLBACK_PATH_DELIMITER) {
                coalesceExternalName = coalesceExternalName.substr(0, coalesceExternalName.length -
                    coalescePathLength)
            }
        }
    }
    return coalesceExternalName;
};

DataHelper.assignDefaultSequnceandSort = function (sortConfig) {
    // Assign default value if sequence is not defined in the config.
    for (let i = 0; i < sortConfig.length; i++) {
        if (typeof sortConfig[i].sortSequence === 'undefined' || sortConfig[i].sortSequence === null) {
            sortConfig[i].sortSequence = 999;
        }
    }
    return sortConfig.sort(function (a, b) {
        return a.sortSequence > b.sortSequence;
    });
};

DataHelper.sortingFunction = function (sortData, models) {
    this.sortData = sortData;
    this.models = models;
    this.sort = function (a, b) {
        let retval = 0;
        if (this.sortData.fields.length) {
            let i = 0;
            /*
                Determine if there is a column that both entities (a and b)
                have that are not exactly equal. The first one that we find
                will be the column we sort on. If a valid column is not
                located, then we will return 0 (equal).
            */
            while ((!a.hasOwnProperty(this.sortData.fields[i]) || !b.hasOwnProperty(this.sortData.fields[
                    i]) || (a.hasOwnProperty(this.sortData.fields[i]) &&
                    b.hasOwnProperty(this.sortData.fields[i]) && a[this.sortData.fields[i]] ===
                    b[this.sortData.fields[i]])) && i < this.sortData.fields.length) {
                i++;
            }
            if (i < this.sortData.fields.length) {
                /*
                    A valid column was located for both entities
                    in the SortData. Now perform the sort.
                */

                const field = this.sortData.fields[i];
                let model = models[field];
                let dataType = model && model.dataType ? model.dataType.toLowerCase() : "string";
                let a1 = (typeof a[field] === "string") ? a[field].toLowerCase() : a[field];
                let b1 = (typeof b[field] === "string") ? b[field].toLowerCase() : b[field];
                if(dataType == "integer" || dataType == "decimal") {
                    a1 = !isNaN(Number(a1)) ? Number(a1) : a1;
                    b1 = !isNaN(Number(b1)) ? Number(b1) : b1;
                }

                if (this.sortData.directions && i < this.sortData.directions.length && this.sortData
                    .directions[i] === 'desc') {
                    if (a1 > b1)
                        retval = -1;
                    else if (a1 < b1)
                        retval = 1;
                } else {
                    if (a1 < b1)
                        retval = -1;
                    else if (a1 > b1)
                        retval = 1;
                }
            }
        }
        return retval;
    }.bind(this);
};

DataHelper.copyToClipboard = function (copyString) {
    if (copyString && RUFUtilities.clipboard) {
        RUFUtilities.clipboard.innerText = copyString;
        RUFUtilities.clipboard.select();
        RUFUtilities.clipboard.blur();
        document.execCommand("Copy");
        RUFUtilities.clipboard.innerText = "";
    }
};

DataHelper.concatValuesFromArray = function (input, seperator) {
    let str = "";
    seperator = seperator || "-";
    if (input instanceof Array) {
        for (let inputIdx = 0; inputIdx < input.length; inputIdx++) {
            let arrayInput = input[inputIdx];
            if (_.isEmpty(arrayInput)) {
                continue;
            }
            let inputStr = arrayInput;
            if (arrayInput instanceof Array) {
                inputStr = DataHelper.concatValuesFromArray(arrayInput, seperator);
            } else if (arrayInput instanceof Object) {
                inputStr = DataHelper.concatValuesFromObject(arrayInput, seperator);
            }

            str = str ? str + " " + seperator + " " + inputStr : inputStr;
        }
    } else if (input instanceof Object) {
        str = DataHelper.concatValuesFromObject(input, seperator)
    } else {
        return input || "";
    }

    return str;
}

DataHelper.concatValuesFromObject = function (input, seperator) {
    let str = "";
    seperator = seperator || "-";
    if (input instanceof Object) {
        for (let key in input) {
            let objInput = input[key];
            if (_.isEmpty(objInput)) {
                continue;
            }
            let inputStr = objInput;
            if (objInput instanceof Array) {
                inputStr = DataHelper.concatValuesFromArray(objInput, seperator);
            } else if (objInput instanceof Object) {
                inputStr = DataHelper.concatValuesFromObject(objInput, seperator);
            }

            str = str ? str + " " + seperator + " " + inputStr : inputStr;
        }
    } else if (input instanceof Array) {
        str = DataHelper.concatValuesFromArray(input, seperator)
    } else {
        return input || "";
    }

    return str;
}

/*
    input: [{
        "key": "value is: {id}"
    }]

    specifiersData: {
        "id": "001"
    }
*/
DataHelper.replaceSpecifiersInArrayValues = function (input, specifiersData) {
    if (input instanceof Array) {
        for (let inputIdx = 0; inputIdx < input.length; inputIdx++) {
            let arrayInput = input[inputIdx];
            if (_.isEmpty(arrayInput)) {
                continue;
            }
            let inputStr = arrayInput;
            if (arrayInput instanceof Array) {
                inputStr = DataHelper.replaceSpecifiersInArrayValues(arrayInput, specifiersData);
            } else if (arrayInput instanceof Object) {
                inputStr = DataHelper.replaceSpecifiersInObjectValues(arrayInput, specifiersData);
            } else {
                inputStr = DataHelper._setValueToSpecifier(inputStr, specifiersData);
            }

            input[inputIdx] = inputStr;
        }
    } else if (input instanceof Object) {
        input = DataHelper.replaceSpecifiersInObjectValues(input, specifiersData)
    } else {
        input = input || "";
    }

    return input;
}

/*
    input: {
        "key1": [
            "value is: {id}"
        ],
        "key2": "value is: {type}"
    }

    specifiersData: {
        "id": "001",
        "type": "rs"
    }
*/
DataHelper.replaceSpecifiersInObjectValues = function (input, specifiersData) {
    if (input instanceof Object) {
        for (let key in input) {
            let objInput = input[key];
            if (_.isEmpty(objInput)) {
                continue;
            }
            let inputStr = objInput;
            if (objInput instanceof Array) {
                inputStr = DataHelper.replaceSpecifiersInArrayValues(objInput, specifiersData);
            } else if (objInput instanceof Object) {
                inputStr = DataHelper.replaceSpecifiersInObjectValues(objInput, specifiersData);
            } else {
                inputStr = DataHelper._setValueToSpecifier(inputStr, specifiersData);
            }

            input[key] = inputStr;
        }
    } else if (input instanceof Array) {
        input = DataHelper.replaceSpecifiersInArrayValues(input, specifiersData)
    } else {
        return input || "";
    }

    return input;
}

DataHelper._setValueToSpecifier = function (inputStr, specifiersData) {
    let regexSpecifiers = /{(.+?)}/g;
    let regexKey = /[{,}]/gi;

    let specifierList = inputStr.match(regexSpecifiers) || [];
    for (let item of specifierList) {
        let key = item.replace(regexKey, '');
        inputStr = inputStr.replace(item, specifiersData[key]);
    }

    return inputStr;
}

DataHelper.checkBrowser = function (browserName) {
    let isValidBrowser = false;
    switch (browserName.toLowerCase()) {
        case "edge":
            if (navigator.userAgent.indexOf("Edge") != -1 && !!window.StyleMedia) {
                isValidBrowser = true;
            }
            break;
        case "firefox":
            if (navigator.userAgent.indexOf("Firefox") != -1) {
                isValidBrowser = true;
            }
            break;
        case "chrome":
            if (navigator.userAgent.indexOf("Chrome") != -1) {
                isValidBrowser = true;
            }
            break;
        default:
            isValidBrowser = false;
            break;
    }

    return isValidBrowser;
}

DataHelper.getNameForNewEntityFromAttributes = function(attributesJSON, attributeModels, flag) {
    let name = "";
    if (!_.isEmpty(attributeModels) && !_.isEmpty(attributesJSON)) {
        let uniqueAttrModel = undefined;
        Object.keys(attributeModels).forEach(function (model) {
            if (attributeModels[model] && attributeModels[model][flag]) {
                uniqueAttrModel = attributeModels[model];
            }
        }, this);

        if (!_.isEmpty(uniqueAttrModel)) {
            let uniqueAttr = attributesJSON.filter(function (attr) {
                if (attr.name == uniqueAttrModel.name) {
                    return attr;
                }
            });

            if (uniqueAttr && uniqueAttr.length == 1) {
                name = uniqueAttr[0].value;
            }
        }
    }

    return name;
}

DataHelper.convertHyphenatedStringFromCamelCase = function (inputString) {
    return inputString.replace(/([A-Z])/g, function ($1) { return "-" + $1.toLowerCase(); });
}

DataHelper.convertCamelCaseStringFromHyphenated = function (inputString) {
    return inputString.replace(/(-[a-z])/g, function ($1) { return $1.replace("-", "").toUpperCase(); });
}

DataHelper.getPastedQueryLength = function (pastedQuery) {
    let pastedQueryLength = 0;
    if(pastedQuery) {
        let pastedQueryArray = pastedQuery.trim().split(/\n|\r/);
        let tempArray = pastedQueryArray.filter(function (item) { return item!= ""});
        pastedQueryLength = tempArray.length;
    }

    return pastedQueryLength;
}
DataHelper.isPublicUrl = function(inputUrl){
    let urlRegEx = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
    return urlRegEx.test(inputUrl);
}
DataHelper.prepareAttributeModelSortCriterion = function(_sortField){
    let sortField = _sortField || 'name';
    let sortProperties = [];
    let sortProperty = {};
    sortProperty[sortField] = "_ASC";
    sortProperty["sortType"] = "_STRING"; // How to determine this?
    sortProperties.push(sortProperty);
    let sort = {};
    sort.properties = sortProperties;
    return sort;
}
DataHelper.prepareOwnershipBasedRelationships = function(relationshipModels){
    for(let relType in relationshipModels){
        let relatedEntityTypesInfo = relationshipModels[relType];
        let relatedEntityTypesCombined = {};
        if(!_.isEmpty(relatedEntityTypesInfo)){
            relatedEntityTypesInfo.forEach(relEntity => {
                let properties = relEntity.properties;
                if(DataHelper.isValidObjectPath(properties, 'relatedEntityInfo')){
                    let ownership = properties.relationshipOwnership;
                    if (relatedEntityTypesCombined[ownership]) {
                        relatedEntityTypesCombined[ownership].properties.relatedEntityInfo.push(...properties.relatedEntityInfo)
                    } else {
                        relatedEntityTypesCombined[properties.relationshipOwnership] = relEntity;
                    }
                }
            });
            if (!_.isEmpty(relatedEntityTypesCombined)) {
                relationshipModels[relType] = [];
                if (relatedEntityTypesCombined.owned) {
                    relationshipModels[relType].push(relatedEntityTypesCombined.owned);
                }
                if(relatedEntityTypesCombined.whereused) {
                    relationshipModels[relType].push(relatedEntityTypesCombined.whereused);
                }
            }
        }
    }
}