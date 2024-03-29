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

import './data-helper.js';
import './data-merge-helper.js';
import '../liquid-dataobject-utils/liquid-dataobject-utils.js';
window.AttributeHelper = window.AttributeHelper || {};

AttributeHelper.getDisplayType = function (dataType) {
    let displayType = 'textbox';

    //Set to lower case
    dataType = dataType ? dataType.toLowerCase() : dataType;

    switch (dataType) {
        case 'boolean': {
            displayType = 'boolean';
            break;
        }
        case 'date': {
            displayType = 'date';
            break;
        }
        case 'datetime': {
            displayType = 'datetime';
            break;
        }
        case 'integer':
        case 'string':
        case 'decimal': {
            displayType = 'textbox';
            break;
        }

    }

    return displayType;
};

AttributeHelper.getCurrentValue = function (values, valueContext, model) {
    let displayType = model.displayType ? model.displayType.toLowerCase() : model.displayType;
    if ((displayType == "textbox" || displayType == "referencelist" || displayType == "path") && model.isCollection) {
        return this.getCurrentValues(values, valueContext, model);
    }

    if (model.dataType === "nested" && !_.isEmpty(values)) {
        return values.filter(item => item.locale === valueContext.locale);
    }

    let value;
    let currentLocale = valueContext ? valueContext.locale : undefined;
    if (values) {
        for (let i = 0; i < values.length; i++) {
            let currentValue = values[i];
            if (!currentValue.action && currentValue.action !== "delete" && currentValue.locale === currentLocale) {
                if (model.dataType.toLowerCase() == "integer" || model.dataType.toLowerCase() == "decimal") {
                    currentValue.value = currentValue.value.toString();
                }
                value = DataHelper.cloneObject(currentValue);

                break;
            }
        }
    }

    return value;
};

AttributeHelper.populateValueContext = function (val, valueContext) {
    for (let valueContextField in valueContext) {
        val[valueContextField] = valueContext[valueContextField];
    }
};

AttributeHelper.getCurrentValues = function (values, valueContext, model) {
    let displayType = model.displayType ? model.displayType.toLowerCase() : model.displayType;
    if (!((displayType == "textbox" || displayType == "path" || displayType == "referencelist") && model.isCollection)) {
        return;
    }

    let _values = [];
    let currentLocale = valueContext ? valueContext.locale : undefined;

    if (values) {
        for (let i = 0; i < values.length; i++) {
            let currentValue = values[i];

            if (!currentValue.action && currentValue.action !== "delete" && currentValue.locale === currentLocale) {
                if (Array.isArray(currentValue.value)) {
                    //When save, already array, then no change
                    _values = _values.concat(currentValue.value);
                } else {
                    _values.push(currentValue.value);
                }
            }
        }
    }

    let val = { "value": _values };
    this.populateValueContext(val, valueContext);
    return val;
};


AttributeHelper.getEmptyValue = function (valueContext, attributeModel) {
    let val = { "value": "", "referenceDataId": "" };
    if (attributeModel && attributeModel.isCollection) {
        val = { "value": [], "referenceDataId": [] };
    }
    this.populateValueContext(val, valueContext);
    return val;
};

AttributeHelper.getEmptyValues = function (valueContexts) {
    let values = [];
    valueContexts.forEach(function (valCtx) {
        let val = { "value": "" };
        this.populateValueContext(val, valCtx);
        values.push(val);
    }, this);
    return { "values": values };
};

AttributeHelper.getFirstAttributeValue = function (attribute) {
    if (attribute && attribute.values && attribute.values.length > 0) {
        return attribute.values[0].value;
    }
    return null;
};

AttributeHelper.getAttributeValues = function (values, valueContext) {
    let _values = [];
    if (values) {
        for (let i = 0; i < values.length; i++) {
            let currentValue = values[i];
            if (valueContext && valueContext.locale && currentValue.locale && currentValue.locale.toLowerCase() != valueContext.locale.toLowerCase()) {
                continue;
            }
            if (valueContext && valueContext.source && currentValue.source && currentValue.source.toLowerCase() != valueContext.source.toLowerCase()) {
                continue;
            }
            if (Array.isArray(currentValue.value)) //When save, already array, then no change
            {
                _values = _values.concat(currentValue.value);
            } else {
                _values.push(currentValue.value);
            }
        }
    }

    return _values;
};

AttributeHelper.getNestedAttributeValues = function (nestedAttribute) {
    return typeof (nestedAttribute) !== "undefined" ? nestedAttribute.group : [];
};

AttributeHelper.getAtributeValueForGrid = function (attribute, model) {
    let val = '';
    if (model && attribute) {
        if (model.isCollection) {
            if (model.dataType === "nested") {
                val = attribute.group && attribute.group.length > 0 ? attribute.group : '';
            } else {
                let values = attribute.values;
                if (values && values.length) {
                    val = AttributeHelper.getAttributeValues(values).join('||')
                }
            }
        } else {
            val = "";
            if (attribute.values && attribute.values.length) {
                if (attribute.values[0].action == "delete") {
                    val = "delete"
                } else {
                    val = attribute.values[0].value
                }
            }
        }
    }
    return val;
};

AttributeHelper.getPropertyTypeByName = function (propertyName) {
    let dataType = "";
    if (propertyName) {
        switch (propertyName.toLowerCase()) {
            case "modifieddate":
            case "createddate":
                dataType = 'datetime';
                break;

            case "createdby":
            case "modifiedby":
                dataType = 'string';
                break;
            case "order":
                dataType = 'integer';
                break;

            default:
                break;
        }
    }
    return dataType;
};

AttributeHelper.getLocaleCoalescePath = function (attribute, type) {
    if (attribute) {
        let clonedAttribute = DataHelper.cloneObject(attribute);

        if (clonedAttribute.values && clonedAttribute.values.length > 0) {
            return AttributeHelper.getLocaleCoalescePathFromValues(clonedAttribute.values, type);
        } else if (clonedAttribute.group && clonedAttribute.group.length > 0) {
            return AttributeHelper.getLocaleCoalescePathFromValues(clonedAttribute.group, type);
        }
    }

    return undefined;
};

AttributeHelper.getLocaleCoalescePathFromValues = function (values, type) {
    let firstValue = undefined;
    if (values.length > 1) {
        values.sort(function (a, b) {
            let aCoalescePaths = a.properties ? DataHelper.getFallbackPathsFromCoalescePath(a.properties.localeCoalescePath) : [];
            let bCoalescePaths = b.properties ? DataHelper.getFallbackPathsFromCoalescePath(b.properties.localeCoalescePath) : [];

            return b.length - a.length;
        });

        firstValue = values.find(val => !_.isEmpty(val.properties) && !_.isEmpty(val.properties.localeCoalescePath));
    } else {
        firstValue = values[0];
    }

    if (firstValue && firstValue.properties && firstValue.properties.localeCoalescePath) {
        if (type === "localeCoalescePathExternalName") {
            return firstValue.properties.localeCoalescePathExternalName;
        } else {
            return firstValue.properties.localeCoalescePath;
        }
    }

    return undefined;
};

AttributeHelper.getExternalNameAndExternalNameAttr = function (entityModel) {
    if (entityModel && entityModel.data && entityModel.data.attributes) {
        let attributes = entityModel.data.attributes;

        if (attributes) {
            let attrKeys = Object.keys(attributes);

            if (attrKeys && attrKeys.length) {
                for (let i = 0; i <= attrKeys.length; i++) {
                    let attr = attributes[attrKeys[i]];
                    if (attr && attr.properties && attr.properties.isExternalName) {
                        let externalName = attr.properties.externalName;
                        return {
                            "externalNameAttr": attrKeys[i],
                            "externalName": externalName
                        };
                    }
                }
            }
        }
    }
};
