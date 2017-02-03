    return response;
}

//route1: "entitiesById.createEntities"
async function createEntities(callPath, args, caller)
{
    var jsonEnvelope = args[0];

    var entities = jsonEnvelope.json[pathRootKey];
    var entityIds = Object.keys(entities);
    //console.log(entities);

    // create new guids for the entities to be created..
    for(let entityId of entityIds) {
        var entity = entities[entityId];
        var newEntityId = uuidV1();
        //console.log('new entity id', newEntityId);
        entity.id = newEntityId;
    }

    return processEntities(entities, "create", caller);
}

//route1: "entitiesById[{keys:entityIds}].updateEntities"
async function updateEntities(callPath, args, caller)
{
    var jsonEnvelope = args[0];
    
    var entities = jsonEnvelope.json[pathRootKey];

    return processEntities(entities, "update", caller);
}

//route1: "entitiesById[{keys:entityIds}].deleteEntities"
async function deleteEntities(callPath, args, caller)
{
    var jsonEnvelope = args[0];
    
    var entities = jsonEnvelope.json[pathRootKey];

    return processEntities(entities, "delete", caller);
}

module.exports = {
    initiateSearchRequest: initiateSearchRequest,
    getSearchResultDetail: getSearchResultDetail,
    getEntities: getEntities,
    createEntities: createEntities,
    updateEntities: updateEntities,
    deleteEntities: deleteEntities
};