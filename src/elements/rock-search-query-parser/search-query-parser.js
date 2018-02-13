/*!
Pass the query string:
The following query string is the sample string which binds to the parser:

"show sku with price > 20 and price<100 and description = Design Art or Wall Decor or Distributive Accessories having hasimages with isprimary = true and hascolorizedimage = true pending newproductsetup newskustosubmit"

*which means show all skus with price value between 20 and 100, description value Design Art or Wall Decor or Distributive Accessories having hasimages relationship with attributes isprimary and hascolrizedimage have value true and which are in new product submit workflow, new skus submit stage.

Stage 1 of parsing is to split the query string with keywords "show", "with", "having" and "pending".

Parsed query json after stage1 looks like:

{
    "show": "sku",
    "with": "price > 20 and price < 100",
    "having": "hasimages with isprimary = true and hascolorizedimage = true",
    "pending": "newproductsetup newskustosubmit"
}

Stage2 is to split the values of each keyword into values based on the keywords present in the value.

Parsed query json after stage2 looks like:

{
    "show": [
        "sku"
    ],
    "with": [
        "price > 20",
        "price < 100",
        "description = Design Art or Wall Decor or Distributive Accessories"
    ],
    "having": [
        {
            "hasimages": {
                "with": [
                    "isprimary = true",
                    "hascolorizedimage = true"
                ]
            }
        }
    ],
    "pending": [
        "newproductsetup",
        "newskustosubmit"
    ]
}

Srage3 is to replace attribute operators between attribute names and it's value with "lte", "gte" or "equals" accordingly.

Parsed query json after stage3 looks like:

{
    "show": [
        "sku"
    ],
    "with": [
        {
            "price": {
                "gte": "20",
                "lte": "100"
            }
        },
        {
            "description": {
                "equals": "Design Art or Wall Decor or Distributive Accessories"
            }
        }
    ],
    "having": [
        {
            "hasimage": {
                "with": [
                    {
                        "isprimary": {
                            "equals": true
                        }
                    },
                    {
                        "hascolorizedimage": {
                            "equals": true
                        }
                    }
                ]
            }
        }
    ],
    "pending": [
        "newproductsetup",
        "newskustosubmit"
    ]
}

Stage 4 is to get the final parsed query to which gives us inputs for the request object preperation for get entities api such as entity data, relationships data and workflow inputs etc.

Parsed query json after stage4 looks like:

{
    "entityData": {
        "types": [
            "sku"
        ],
        "attributes": [
            {
                "price": {
                    "gte": "20",
                    "lte": "20"
                }
            },
            {
                "description": {
                    "equals": "Design Art or Wall Decor or Distributive Accessories"
                }
            }
        ]
    },
    "entityRelationships": {
        "relationshipName": "hasimage",
        "attributes": [
            {
                "isprimary": {
                    "equals": true
                }
            },
            {
                "hascolorizedimage": {
                    "equals": true
                }
            }
        ]
    },
    "workflowCriterion": {
        "workflowShortName": "newproductsetup",
        "workflowActivityName": "newskustosubmit"
    }
}
*/

var queryParser = {};

queryParser.options = {};
queryParser.options["startsWith"] = "!%&show&%!";
queryParser.options["keywords"] = ["!%&show&%!", "!%&with&%!", "!%&having&%!", "!%&pending&%!", "!%&_ANY&%!"];
queryParser.options["attributeKeywords"] = ["!%&and&%!"];
queryParser.options["operators"] = ["=", ">", "<"];

queryParser.mappings = {
    "=": "equals",
    ">": "gte",
    "<": "lte"
};

queryParser.parse = function (string, options, mappings) {

    if (!options) {
        options = queryParser.options;
    } else {
        queryParser.options = options;
    }

    if (!mappings) {
        mappings = queryParser.mappings;
    } else {
        queryParser.mappings = mappings;
    }

    if (!string) {
        string = '';
    }

    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }

    if (!string.startsWith(options.startsWith)) {
        return "invalid string";
    }

    var parsedQuery = queryParser.parseQuery(string, true);

    var finalQuery = queryParser.getFinalQuery(parsedQuery, options, mappings);

    return finalQuery;

};

queryParser.parseQuery = function (string, followPreference, isSubQuery) {
    var keywordIndices = queryParser.getKeywordIndices(string, queryParser.options.keywords);

    if(keywordIndices.length > 0) {
        if(followPreference) {
            keywordIndices = queryParser.removeExtraIndices(keywordIndices);
        }
        keywordIndices.sort(function (a, b) { return a.index - b.index });
        var keyValuesFromIndices = queryParser.getKeyValuesFromIndices(string, keywordIndices, isSubQuery);
        
        if(!queryParser.isEmptyObject(keyValuesFromIndices)) {
            var keysWithSplitValuesByKeywords = queryParser.splitValuesByKeywords(keyValuesFromIndices, queryParser.options.attributeKeywords, isSubQuery);

            if(!queryParser.isEmptyObject(keysWithSplitValuesByKeywords)) {
                var keysWithSplitValuesByOperators = queryParser.splitValuesByOperators(keysWithSplitValuesByKeywords, queryParser.options.operators, queryParser.mappings);

                return keysWithSplitValuesByOperators;
            }
        }
    } else {
        return string;
    }
};

queryParser.getKeywordIndices = function (string, keywords) {
    var keywordIndices = [];
    for (var i = 0; i < keywords.length; i++) {
        var keyword = keywords[i];
        var keywordIndex = string.indexOf(keyword);
        if (keywordIndex !== -1) {
            var obj = {
                "key": keyword,
                "index": keywordIndex
            };
            keywordIndices.push(obj);
        }
    }

    if(keywordIndices.length > 0) {
        var obj = {
            "key": "end",
            "index": string.length
        }
        keywordIndices.push(obj);
    }

    return keywordIndices;
};

queryParser.removeExtraIndices = function(indices) {
    var indicesToRemove = [];
    for(var i=1; i<indices.length; i++) {
        if(indices[i-1].index > indices[i].index) {
            indicesToRemove.push(i-1);
        }
    }
    if(indicesToRemove.length > 0) {
        for(var i=0; i<indicesToRemove.length; i++) {
        var indexToRemove = indicesToRemove[i];
        indices.splice(indexToRemove, 1);
        }
    }
    return indices;
};

queryParser.getKeyValuesFromIndices = function(string, indices, isSubQuery) {
    var keyValues = {};
    if(indices.length > 0 && indices[0].index !== 0) {
        var extraText = string.slice(0, indices[0].index);
        keyValues["extraText"] = extraText.trim();
    }
    
    for(var i=1; i<indices.length; i++) {
        var indexObject = indices[i-1];
        var indexObject1 = indices[i];
        var startIndex = indexObject.index;
        var endIndex = indexObject1.index;
        if(isSubQuery && indexObject.key === "!%&show&%!") {
            endIndex = indices[indices.length -1].index;
            i=indices.length;
        }
        var value = string.slice(startIndex, endIndex);
        var sepIndex = value.indexOf(" ");
        if(sepIndex) {
            value = value.slice(sepIndex + 1).trim();
        }
        keyValues[indexObject.key] = value;
    }

    return keyValues;
};

queryParser.splitValuesByKeywords = function(keyValues, keywords, isSubQuery) {
    var keys = Object.keys(keyValues);

    var valuesSplitByKeywords = {};
    if(keys && keys.length > 0) {
        var extraText;
        var obj = {};
        var regex = queryParser.prepareRegex(keywords);
        for(var i=0; i<keys.length; i++) {
            var key = keys[i];
            var value = keyValues[key];
            key = key.replace(/!|%|&/g,'');
            var valueList;
            if(key === "having") {
                // send the value for parsing
                valueList = [queryParser.parseQuery(value, false, true)];
            } else if(key === "pending") {
                valueList = value.split(" ");
            } else if(key === "extraText") {
                extraText = value;
            } else if(key === "_ANY") {
                valueList = [value];
            } else if(isSubQuery && key === "show") {
                let val = keys[i] + " " + value;
                valueList = [queryParser.parseQuery(val)];
            } else {
                valueList = value.split(regex).map(function(item) {
                    return item.replace(/'|"/g, '').trim();
                });
            }
            if(valueList) {
                obj[key] = valueList;
            }
        }
        if(extraText) {
            valuesSplitByKeywords[extraText] = obj;
        } else {
            valuesSplitByKeywords = obj;
        }
    }

    return valuesSplitByKeywords;
};

queryParser.splitValuesByOperators = function(keyValues, operators, mappings) {
    var keys = Object.keys(keyValues);

    var valuesSplitByOperators = {};
    if(keys && keys.length > 0) {
        var regex = queryParser.prepareRegex(operators);
        for(var i=0; i<keys.length; i++) {
            var key = keys[i];
            var val = keyValues[key];
            if(val instanceof Array && val.length > 0) {
                for(var j=0; j<val.length; j++) {
                    var value = val[j];
                    if(typeof(value) === "string") {
                        var operator = operators.find(char => value.indexOf(char) !== -1);
                        if(operator) {
                            var sepIndex = value.indexOf(operator);
                            var attrName = value.slice(0,sepIndex).trim();
                            value = value.slice(sepIndex + 1).trim();
                            operator = mappings[operator];
                            var valObj = {};
                            valObj[attrName] = valObj[attrName] || {};
                            valObj[attrName][operator] = value;
                            valuesSplitByOperators[key] = valuesSplitByOperators[key] || [];
                            var existingAttr = valuesSplitByOperators[key].find(obj => obj[attrName] !== undefined);
                            if(existingAttr) {
                                existingAttr[attrName][operator] = value;
                            } else {
                                valuesSplitByOperators[key].push(valObj);
                            }
                        } else {
                            valuesSplitByOperators[key] = valuesSplitByOperators[key] || [];
                            valuesSplitByOperators[key].push(value);
                        }
                    } else {
                        valuesSplitByOperators[key] = valuesSplitByOperators[key] || [];
                        valuesSplitByOperators[key].push(value);
                    }
                }
            } else if(val instanceof Object) {
                var valObj = queryParser.splitValuesByOperators(val, operators, mappings);
                valuesSplitByOperators[key] =[valObj];
            } else {

            }
        }
    }

    return valuesSplitByOperators;
};

queryParser.getFinalQuery = function(parsedQuery) {
    if(!queryParser.isEmptyObject(parsedQuery)) {
        var finalQuery = {};

        var entityTypes = parsedQuery.show;
        var entityAttributes = parsedQuery.with && parsedQuery.with.length > 0 ? parsedQuery.with : undefined;
        var relatioshipsSection = parsedQuery.having && parsedQuery.having[0] ? parsedQuery.having[0] : undefined;
        var relationshipName;
        var relationshipAttributes;
        var relatedEntityQuery;
        if(relatioshipsSection) {
            if(typeof(relatioshipsSection) === "string") {
                relationshipName = relatioshipsSection;
            } else if(typeof(relatioshipsSection) === "object") {
                relationshipName = Object.keys(relatioshipsSection) && Object.keys(relatioshipsSection).length > 0 ? Object.keys(relatioshipsSection)[0] : undefined;
            }
            if(relationshipName && relatioshipsSection[relationshipName] && relatioshipsSection[relationshipName].length >0 && relatioshipsSection[relationshipName][0]) {
                let relData = relatioshipsSection[relationshipName][0];
                relationshipAttributes = relData.with && relData.with.length > 0 ? relData.with : undefined;
                relatedEntityQuery = relData.show && relData.show.length > 0 ? queryParser.getFinalQuery(relData.show[0]) : undefined;
            }
        }
        var workflowName = parsedQuery.pending && parsedQuery.pending.length > 0 ? parsedQuery.pending[0] : undefined;
        var workflowActivityName = parsedQuery.pending && parsedQuery.pending.length > 0 ? parsedQuery.pending[1] : undefined;

        var searchQuery = parsedQuery._ANY && parsedQuery._ANY.length > 0 ? parsedQuery._ANY[0] : undefined;

        if (entityTypes) {
            var entityData = {
                "types": entityTypes,
                "attributes": entityAttributes
            }
            finalQuery.entityData = entityData;
        }
        if (relationshipName) {
            var entityRelationships = {
                "relationshipName": relationshipName,
                "attributes": relationshipAttributes
            }
            if(relatedEntityQuery) {
                entityRelationships.relatedEntityData = relatedEntityQuery.entityData;
            }
            finalQuery.entityRelationships = entityRelationships;
        }
        if (workflowName && workflowActivityName) {
            var workflowCriterion = {
                "workflowShortName": workflowName,
                "workflowActivityName": workflowActivityName
            }
            finalQuery.workflowCriterion = workflowCriterion;
        }
        if(searchQuery) {
            finalQuery.searchQuery = searchQuery;
        }
        return finalQuery;
    }
};

queryParser.prepareRegex = function(keywords) {
    var strForRegex = "";
    for(var i=0; i<keywords.length; i++) {
        var keyword = keywords[i];
        if(i !== keywords.length - 1) {
            strForRegex = strForRegex + " " + keyword + " |";
        } else {
            strForRegex = strForRegex + " " + keyword;
        }
    }

    var regex = new RegExp(strForRegex, "ig");

    return regex;
};

queryParser.isEmptyObject = function (obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
};