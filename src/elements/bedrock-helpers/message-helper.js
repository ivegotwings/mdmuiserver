import './data-helper.js';
let MessageHelper = {};

MessageHelper.getAttributeMessages = function (attributes, attributeModels, messageCodeMapping, localeHelper) {
    let attrMessages = {};
    for (let attributeName in attributes) {
        let attrModel = attributeModels[attributeName];
        let attribute = attributes[attributeName];
        if (attrModel) {
            if (attrModel.dataType.toLowerCase() == "nested" && !_.isEmpty(attrModel.group)) {
                let nestedAttrMessages = {};
                let attrModelGroup = attrModel.group[0];

                let parentAttrMessageCodes = MessageHelper.getMessageCodes(attribute);
                if (!_.isEmpty(parentAttrMessageCodes)) {
                    let parentAttrMessages = MessageHelper.getMessagesFromCodes(parentAttrMessageCodes, messageCodeMapping, localeHelper, attributeModels);

                    if(!_.isEmpty(parentAttrMessages)) {
                        nestedAttrMessages[attributeName] = parentAttrMessages;
                    }
                }

                if (attribute.group && attrModelGroup) {
                    attribute.group.forEach(group => {
                        let messages = [];
                        let groupAttrMessageCodes = MessageHelper.getMessageCodes(group);
                        if (!_.isEmpty(groupAttrMessageCodes)) {
                            let groupAttrMessages = MessageHelper.getMessagesFromCodes(groupAttrMessageCodes, messageCodeMapping, localeHelper, attributeModels);
                            if (groupAttrMessages && groupAttrMessages.length) {
                                groupAttrMessages.forEach(msg => {
                                    messages.push(msg);
                                })
                            }
                        }

                        Object.keys(group).forEach(childAttr => {
                            let childAttrMessageCodes = MessageHelper.getMessageCodes(group[childAttr]);
                            let childAttrMessages = MessageHelper.getMessagesFromCodes(childAttrMessageCodes, messageCodeMapping, localeHelper, attributeModels, true);
                            if (childAttrMessages && childAttrMessages.length) {
                                childAttrMessages.forEach(msg => {
                                    let externalName = DataHelper.isValidObjectPath(attrModelGroup, childAttr + ".properties.externalName") ? attrModelGroup[childAttr].properties.externalName : "";
                                    let formattedMsg = !_.isEmpty(externalName) ? externalName + ": " + msg : msg;
                                    messages.push(formattedMsg);
                                })
                            }
                        });

                        if(!_.isEmpty(messages)) {
                            nestedAttrMessages[group.id] = messages;
                        }
                    });
                }

                if (!_.isEmpty(nestedAttrMessages)) {
                    attrMessages[attributeName] = [nestedAttrMessages];
                }
            } else {
                let messageCodes = MessageHelper.getMessageCodes(attribute);
                let messages = MessageHelper.getMessagesFromCodes(messageCodes, messageCodeMapping, localeHelper, attributeModels);
                if (messages && messages.length) {
                    attrMessages[attributeName] = messages;
                }
            }
        }
    }
    return attrMessages;
};

MessageHelper.getRelationshipMessages = function (relationship, messageCodeMapping, localeHelper) {
    let messageCodes = MessageHelper.getMessageCodes(relationship);
    let messages = MessageHelper.getMessagesFromCodes(messageCodes, messageCodeMapping, localeHelper);
    return messages;
};

MessageHelper.getRelationshipsMessages = function (relationships, messageCodeMapping, localeHelper) {
    let messages = [], message;
    for (let i = 0; i < relationships.length; i++) {
        message = MessageHelper.getRelationshipMessages(relationships[i], messageCodeMapping, localeHelper)
        Array.prototype.push.apply(messages, message);
    }
    return messages;
};

MessageHelper.getMessageCodes = function (attribute) {
    let messageCodes = [];
    let properties = attribute.properties;
    let messages = [];
    if (properties && properties.messages && properties.messages.length > 0) {
        messages = messages.concat(properties.messages);
    }
    if(!_.isEmpty(attribute.values)) {
        for(let valIdx = 0; valIdx < attribute.values.length; valIdx++) {
            let value = attribute.values[valIdx];
            let valueId = value.value ? value.value.substr(value.value.indexOf('/') + 1, value.value.length) : undefined;
            if(DataHelper.isValidObjectPath(value,"properties.messages.0")) {
                let valueMessages = value.properties.messages;
                for (let i = 0; i < valueMessages.length; i++) {
                    messageCodes.push({ "code": valueMessages[i].messageCode, "params": valueMessages[i].messageParams, "valueId": valueId });
                }
            }
        }
    }
    if (messages && messages.length > 0) {
        for (let i = 0; i < messages.length; i++) {
            messageCodes.push({ "code": messages[i].messageCode, "params": messages[i].messageParams });
        }
    }

    return messageCodes;
};

MessageHelper.getMessagesFromCodes = function (messageCodes, messageCodeMapping, localeHelper, attributeModels, isNestedChild) {
    let messages = [];
    if (messageCodes && messageCodes.length > 0) {
        for (let i = 0; i < messageCodes.length; i++) {
            let messageCode = messageCodes[i];
            if (messageCode.code != 'SYS001') {
                let mes = undefined;

                //Pick message from locale
                if (localeHelper) {
                    if (messageCode.params) {
                        let params = messageCode.params instanceof Array ? messageCode.params : [messageCode.params];
                        let localeParams = [messageCode.code];
                        for (let j = 0; j < params.length; j++) {
                            localeParams.push(j);
                            //If attributename, then show external name
                            if (attributeModels) {
                                if (attributeModels[params[j]]) {
                                    localeParams.push(attributeModels[params[j]].externalName);
                                    continue;
                                }
                            }

                            localeParams.push(params[j]);
                        }

                        mes = localeHelper.apply(this, localeParams);
                    } else {
                        mes = localeHelper(messageCode.code);
                    }
                }

                //If message not picked from locale, then pick from config mappings
                if (!mes && messageCodeMapping) {
                    mes = messageCodeMapping[messageCode.code];
                }

                let message;
                if (mes) {
                    message = mes;
                } else {
                    message = "Error with Code: " + messageCode.code;
                }
                if(messageCode.valueId && !isNestedChild) {
                    message = message + "@#@valueId:" + messageCode.valueId;
                }
                messages.push(message);
            }
        }
    }
    return messages;
};

MessageHelper.getErrorsFromAttrMessages = function (attrMessages, attributeModels, relationship) {
    let messageObjects = [], messageObject, externalName, currentAttributeMessages, relationshipRelToId;
    for (let attributeName in attrMessages) {
        externalName = attributeModels[attributeName].externalName;
        currentAttributeMessages = attrMessages[attributeName];
        relationshipRelToId = "";
        if (currentAttributeMessages && currentAttributeMessages.length > 0) {
            for (let i = 0; i < currentAttributeMessages.length; i++) {
                if (relationship && relationship.relTo && relationship.relTo.id) {
                    relationshipRelToId = relationship.relTo.id
                }
                messageObject = {
                    "relationshipRelToId": relationshipRelToId,
                    "attributeName": attributeName,
                    "attributeExternalName": externalName,
                    "message": currentAttributeMessages[i]
                };
                messageObjects.push(messageObject);
            }
        }
    }
    return messageObjects;
};

MessageHelper.getErrorsFromRelMessages = function (relMessages, messageCodeMapping, localeHelper) {
    let errorMessages = [], errorMessageObj, relObj, relationshipRelToId, attrMessages, attributeErrors;
    for (let i in relMessages) {
        relObj = relMessages[i];
        relationshipRelToId = "";
        attrMessages = MessageHelper.getAttributeMessages(relObj.relAttributes, relObj.attrModels, messageCodeMapping, localeHelper);
        attributeErrors = MessageHelper.getErrorsFromAttrMessages(attrMessages, relObj.attrModels, relObj.relationship);
        if (relObj && relObj.relMessage && relObj.relMessage.length > 0) {
            for (i = 0; i < relObj.relMessage.length; i++) {
                errorMessageObj = {
                    "attributeName": relObj.relTitle,
                    "message": relObj.relMessage[i]
                }
                if (relObj.relationship[i] && relObj.relationship[i].relTo && relObj.relationship[i].relTo.id) {
                    errorMessageObj["relationshipRelToId"] = relObj.relationship[i].relTo.id
                }
                errorMessages.push(errorMessageObj);
            }
        }
        errorMessages.push.apply(errorMessages, attributeErrors);
    }
    return errorMessages;
};

MessageHelper.getErrorsFromWhereUsedMessages = function (relMessages, messageCodeMapping, localeHelper) {
    let errorMessages = [], relObj, attrMessages, attributeErrors, errorMessage;
    for (let i in relMessages) {
        relObj = relMessages[i];
        attrMessages = MessageHelper.getAttributeMessages(relObj.relAttributes, relObj.attrModels, messageCodeMapping, localeHelper);
        attributeErrors = MessageHelper.getErrorsFromAttrMessages(attrMessages, relObj.attrModels);
        errorMessage = {
            "fromEntity": relObj.fromEntityId,
            "fromEntityType": relObj.fromEntityType,
            "attrErrorMessages": attributeErrors
        };
        errorMessages.push(errorMessage);
    }
    return errorMessages;
};

export default MessageHelper