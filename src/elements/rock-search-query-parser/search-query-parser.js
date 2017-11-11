var queryParser = {};

queryParser.options = {};
queryParser.options["startsWith"] = "show";
queryParser.options["keywords"] = ["show", "with", "having", "pending"];
queryParser.options["attributeKeywords"] = ["and"];
queryParser.options["operators"] = ["=", ">", "<", "from", "to"];

queryParser.mappings = {
  "show": "type",
  "with": "attributes",
  "having": "relationships",
  "=": "equals",
  ">": "gte",
  "<": "lte",
  "from": "gte",
  "to": "lte"
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

  var parsedQuery = queryParser.parseQuery(string, options.keywords, true);

  var finalQuery = queryParser.getFinalQuery(parsedQuery, options, mappings);

  return finalQuery;

};

queryParser.parseQuery = function (string, keywords, followPreference) {
  var parsedQuery = {};

  var keywordIndices = queryParser.getKeywordIndices(string, keywords);

  if (keywordIndices.length > 1 || followPreference) {
    if(followPreference) {
      keywordIndices = queryParser.removeUnwantedIndices(keywordIndices);
    }
    keywordIndices.sort(function (a, b) { return a - b });
    var childQueries = queryParser.getChildQueris(string, keywordIndices);

    if (childQueries.length > 0) {
      var myQuery = queryParser.getQueryObject(childQueries);
      parsedQuery = queryParser.getParsedQuery(myQuery, queryParser.options);
    }
  }
  return parsedQuery;
};

queryParser.removeUnwantedIndices = function(indices) {
  var indicesToRemove = [];
  for(var i=0; i<indices.length; i++) {
    if(indices[i] > indices[i+1]) {
      indicesToRemove.push(i);
    }
  }
  if(indicesToRemove.length > 0) {
    for(var i=0; i<indicesToRemove.length; i++) {
      var indexToRemove = indicesToRemove[i];
      indices.splice(indexToRemove, 1);
    }
  }
  return indices;
}

queryParser.getKeywordIndices = function (string, keywords) {
  var keywordIndices = [0];
  for (i = 0; i < keywords.length; i++) {
    var keyword = keywords[i];
    if (queryParser.options.attributeKeywords.indexOf(keyword) !== -1) {
      var regex = new RegExp(keyword, "gi");
      var result, indices = [];
      while ((result = regex.exec(string))) {
        if (result.index !== 0) {
          indices.push(result.index);
        }
      }
      if (indices.length > 0) {
        keywordIndices = keywordIndices.concat(indices);
      }
    } else {
      var keywordIndex = string.indexOf(keyword);
      if (keywordIndex > 0) {
        keywordIndices.push(keywordIndex);
      }
    }
  }

  if(keywordIndices.length > 1) {
    keywordIndices.push(string.length);
  }

  return keywordIndices;
};

queryParser.getChildQueris = function (string, keywordIndices) {
  var childQueries = [];
  if (keywordIndices.length > 1) {
    for (var i = 1; i < keywordIndices.length; i++) {
      var startIndex = keywordIndices[i - 1];
      var endIndex = keywordIndices[i];
      var q = string.slice(startIndex, endIndex);
      var sepIndex = q.indexOf(' ');
      if (sepIndex !== -1) {
        var key = q.slice(0, sepIndex);
        if (queryParser.options.keywords.indexOf(key) !== -1 || queryParser.options.operators.indexOf(key) !== -1) {
          q = q.replace(' ', ':');
        } else if (queryParser.options.attributeKeywords.indexOf(key) !== -1) {
          q = q.slice(sepIndex + 1);
        }
      }
      q = q.trim();
      childQueries.push(q);
    }
  } else if(keywordIndices.length = 1) {
    var q = string;
    var sepIndex = q.indexOf(' ');
    if (sepIndex !== -1) {
      var key = q.slice(0, sepIndex);
      if (queryParser.options.keywords.indexOf(key) !== -1 || queryParser.options.operators.indexOf(key) !== -1) {
        q = q.replace(' ', ':');
      } else if (queryParser.options.attributeKeywords.indexOf(key) !== -1) {
        q = q.slice(sepIndex + 1);
      }
    }
    q = q.trim();
    childQueries.push(q);
  }

  return childQueries;
};

queryParser.getQueryObject = function (queries) {
  var myQuery = {};
  myQuery.texts = [];

  if (queries.length > 0) {
    for (var i = 0; i < queries.length; i++) {
      var term = queries[i];
      var sepIndex = term.indexOf(':');
      if (sepIndex !== -1) {
        var split = term.split(':'),
          key = term.slice(0, sepIndex),
          val = term.slice(sepIndex + 1);
        myQuery[key] = val;
      } else {
        myQuery.texts.push(term);
      }
    }
  }

  return myQuery;
};

queryParser.getParsedQuery = function (query, options) {
  var parsedQuery = {};
  var keys = Object.keys(query);
  if (keys && keys.length > 0) {
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var val = query[key];
      if (key !== "texts") {
        var q = queryParser.parseQuery(val, options.keywords);
        if (queryParser.isEmptyObject(q)) {
          q = queryParser.parseQuery(val, options.attributeKeywords);
          if (!queryParser.isEmptyObject(q)) {
            val = q;
          }
        } else {
          val = q;
        }
        parsedQuery[key] = val;
      } else {
        parsedQuery[key] = val;
      }
    }
  }

  return parsedQuery;
};

queryParser.isEmptyObject = function (obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};

queryParser.getFinalQuery = function (parsedQuery, options, mappings) {
  var finalQuery = {};
  var entityData = {};
  var entityRelationships = {};
  var relatedEntityData = {};
  var searchEntityTypes = parsedQuery.show.texts ? parsedQuery.show.texts : [parsedQuery.show];
  var entityAttributes = {};
  var relationshipName = undefined;
  var relatedEntityType = undefined;
  var relationshipAttributes = {};
  var relatedEntityAttributes = {};
  var workflowCriterion = undefined;
  if (parsedQuery.with) {
    if (parsedQuery.with.texts && parsedQuery.with.texts.length > 0) {
      for (var i = 0; i < parsedQuery.with.texts.length; i++) {
        var text = parsedQuery.with.texts[i];
        entityAttributes = queryParser.getAttributesObject(entityAttributes, text, options.operators, mappings);
      }
    } else {
      entityAttributes = queryParser.getAttributesObject(entityAttributes, parsedQuery.with, options.operators, mappings);
    }
  }
  if (parsedQuery.having) {
    relationshipName = parsedQuery.having.texts && parsedQuery.having.texts[0] ? parsedQuery.having.texts[0] : undefined;
    if (parsedQuery.having.with) {
      if (parsedQuery.having.with.texts && parsedQuery.having.with.texts.length > 0) {
        for (var i = 0; i < parsedQuery.having.with.texts.length; i++) {
          var text = parsedQuery.having.with.texts[i];
          relationshipAttributes = queryParser.getAttributesObject(relationshipAttributes, text, options.operators, mappings);
        }
      } else {
        relationshipAttributes = queryParser.getAttributesObject(relationshipAttributes, parsedQuery.having.with, options.operators, mappings);
      }
    }
    if (parsedQuery.having.show) {
      relatedEntityType = parsedQuery.having.show.texts && parsedQuery.having.show.texts[0] ? parsedQuery.having.show.texts[0] : undefined;
      if (parsedQuery.having.show.with) {
        if (parsedQuery.having.show.with.texts && parsedQuery.having.show.with.texts.length > 0) {
          for (var i = 0; i < parsedQuery.having.show.with.texts.length; i++) {
            var text = parsedQuery.having.show.with.texts[i];
            relatedEntityAttributes = queryParser.getAttributesObject(relatedEntityAttributes, text, options.operators, mappings);
          }
        } else {
          relatedEntityAttributes = queryParser.getAttributesObject(relatedEntityAttributes, parsedQuery.having.show.with, options.operators, mappings);
        }
      }
    }
  }
  if(parsedQuery.pending) {
    if(parsedQuery.pending.texts && parsedQuery.pending.texts.length) {
        var text = parsedQuery.pending.texts[0];
        var textsArray = text.split(" ");
        workflowCriterion = {
          "workflowShortName": textsArray[0],
          "workflowActivityName": textsArray[1]
        }
    } else {
      var text = parsedQuery.pending;
      var textsArray = text.split(" ");
      workflowCriterion = {
        "workflowShortName": textsArray[0],
        "workflowActivityName": textsArray[1]
      }
    }
  }
  if (searchEntityTypes) {
    entityData = {
      "types": searchEntityTypes,
      "attributes": entityAttributes
    }
    finalQuery.entityData = entityData;
  }
  if (relationshipName) {
    entityRelationships = {
      "relationshipName": relationshipName,
      "attributes": relationshipAttributes
    }
    finalQuery.entityRelationships = entityRelationships;
  }
  if (relatedEntityType) {
    relatedEntityData = {
      "type": relatedEntityType,
      "attributes": relatedEntityAttributes
    }
    finalQuery.relatedEntityData = relatedEntityData;
  }
  if(workflowCriterion) {
    finalQuery.workflowCriterion = workflowCriterion;
  }
  return finalQuery;
};

queryParser.getAttributesFromText = function (text, operators, mappings) {
  var attrObject = {};
  var attributeWithValues = queryParser.parseQuery(text, operators);
  var keys = Object.keys(attributeWithValues);
  if (keys && keys.length > 0) {
    for (var j = 0; j < keys.length; j++) {
      var key = keys[j];
      if (key !== "texts") {
        var operator = mappings[key];
        attrObject[operator] = attributeWithValues[key];
      } else {
        attrObject["name"] = attributeWithValues[key][0];
      }
    }
  }

  return attrObject;
};

queryParser.getAttributesObject = function(attributes, text, operators, mappings) {
  var attrObject = queryParser.getAttributesFromText(text, operators, mappings);
  var attrName = attrObject && attrObject.name ? attrObject.name : undefined;
  if (attrName) {
    delete attrObject.name;
    attributes[attrName] = attributes[attrName] ? attributes[attrName] : {};
    var keys = Object.keys(attrObject);
    if(keys && keys.length > 0) {
      for(var i=0; i<keys.length; i++) {
        var key = keys[i];
        attributes[attrName][key] = attrObject[key];
      }
    }
  }

  return attributes;
};