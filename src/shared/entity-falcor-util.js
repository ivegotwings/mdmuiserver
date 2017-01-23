'use strict';

var EntityFalcorUtil = function() { };

EntityFalcorUtil.boxEntityData = function(entity){
    console.log('yes..i m initialized.');
};
        
EntityFalcorUtil.boxEntityData = function(entity, boxOp){
    var modEntity = {};

    for(var entityFieldKey in entity) {
        if(entityFieldKey === "data") {
            var modCtxInfo = {};

            for(var ctxKey in entity.data.ctxInfo) {
                var enCtxInfo = entity.data.ctxInfo[ctxKey];

                var modAttrs = EntityFalcorUtil.boxAttributesData(enCtxInfo.attributes, boxOp);
                var modRelationships = EntityFalcorUtil.boxRelationshipsData(enCtxInfo.relationships, boxOp);
                
                modCtxInfo[ctxKey] = { "attributes": modAttrs, "relationships": modRelationships };
            }
            
            modEntity.data = { 'ctxInfo': modCtxInfo };
        }
        else {
            modEntity[entityFieldKey] = boxOp(entity[entityFieldKey]);
        }
    }

    //console.log('boxedEntity ', modEntity);
    return modEntity;
};

EntityFalcorUtil.boxAttributesData = function(attrs, boxOp) {
    if(!attrs) { 
        return;
    }

    var modAttrs = {};

    for(var attrId in attrs) {
        var modAttr = EntityFalcorUtil.cloneObject(attrs[attrId]);

        for(var valIndex in modAttr.values) {
            var val = modAttr.values[valIndex];
            
            if(val && val.name !== undefined){
                delete val.name; // if name is coming as field inside val
            }
        }

        modAttr.values = boxOp(modAttr.values);
        modAttrs[attrId] = modAttr;
    }

    return modAttrs;
};

EntityFalcorUtil.boxRelationshipsData = function(relationships, boxOp) {
    if(!relationships) { 
        return;
    }

    var modRelationships = {};

    for(var relTypeIdx in relationships) {
        var modRelTypeObj = EntityFalcorUtil.cloneObject(relationships[relTypeIdx]);

        for(var relId in modRelTypeObj.rels) {
            var rel = modRelTypeObj.rels[relId];
            
            for(var relObjKey in rel) {
                if(relObjKey === "attributes") {
                    rel[relObjKey] = EntityFalcorUtil.boxAttributesData(rel[relObjKey], boxOp);
                }
                else {
                    rel[relObjKey] = boxOp(rel[relObjKey]);
                }
            }
        }

        modRelationships[relTypeIdx] = modRelTypeObj;
    }

    return modRelationships;
};

EntityFalcorUtil.boxJsonObject = function(obj){
    return {'$type': "atom", 'value': obj };
};

EntityFalcorUtil.unboxJsonObject = function(obj) {
    if (obj && obj.$type) {
        return obj.value;
    } else {
        return obj;
    }
};

EntityFalcorUtil.cloneObject = function(obj) {
    var clonedObj = {};
    
    if(obj) {
        clonedObj = JSON.parse(JSON.stringify(obj));
    }

    return clonedObj;
}

EntityFalcorUtil.test = function() {
    console.log('test success');
}

var SharedUtils = SharedUtils || {};

//register as module or as js 
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = EntityFalcorUtil
    }
    exports.EntityFalcorUtil = EntityFalcorUtil
}
else {
    if(!SharedUtils) {
        SharedUtils = {};
    }
    SharedUtils.EntityFalcorUtil = EntityFalcorUtil
}

