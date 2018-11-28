let DFServiceRest = require("../../common/df-rest-service/DFRestService");
let falcorUtil = require('../../../../shared/dataobject-falcor-util');
let isEmpty = require('../../common/utils/isEmpty');
let tenantSystemConfigService = require('../configuration-service/TenantSystemConfigService');
let DataObjectLineageService = function (options) {
    DFServiceRest.call(this, options)
}

DataObjectLineageService.prototype = {
    get: async function (request) {
        return await this._getLineagePathDetails(request);
    },

    _getLineagePathDetails: async function (request) {
        let response = {};
        try {
            let relationshipType = falcorUtil.isValidObjectPath(request, "params.fields.relationships") && request.params.fields.relationships[0];
            let relAttribute = falcorUtil.isValidObjectPath(request, "params.fields.relationshipAttributes") && request.params.fields.relationshipAttributes[0];

            if (relationshipType && relAttribute) {
                //request.params.fields.relationships = [relationshipType];
                response = await this.post("entityservice/get", request);

                if (response && falcorUtil.isValidObjectPath(response, "response.entities")) {
                    let paths = [];
                    for (let entity of response.response.entities) {
                        if (falcorUtil.isValidObjectPath(entity, "data.relationships")) {
                            let entityId = entity.data.relationships[relationshipType][0].relTo.id;
                            let entityType = entity.data.relationships[relationshipType][0].relTo.type;

                            paths = await this._getLineageEntity(entityId, entityType, relationshipType, [entity.name]);
                        } else {
                            paths = [entity.name];
                        }

                        if (!isEmpty(paths)) {
                            //Removing root node path since UI is appending root node externalName
                            paths.pop();
                            
                            if(!falcorUtil.isValidObjectPath(entity, "data.relationships")) {
                                entity.data.relationships = {};
                                entity.data.relationships[relationshipType] = [{}];
                            }

                            !falcorUtil.isValidObjectPath(entity, "data.relationships." + relationshipType) && (entity.data.relationships[relationshipType] = [{}]);
                            
                            let relAttributes = {}
                            let tenantSetting = await tenantSystemConfigService.prototype.getCachedTenantMetaData();
                            let tenantConfigKey = tenantSetting["tenant-settings-key"];
                            relAttributes[relAttribute] = {
                                "values": [
                                    {
                                        "locale": tenantSetting[tenantConfigKey].defaultValueLocale,
                                        "source": tenantSetting[tenantConfigKey].defaultValueSource,
                                        "id": "7166b3f5-e50b-416c-9a13-1df35a8eece2",
                                        "value": paths.reverse().join(">>")
                                    }
                                ]
                            }

                            entity.data.relationships[relationshipType][0].attributes = relAttributes;
                        }
                    }
                }
            }
        }

        catch (err) {
            console.log('Failed to get event data.\nError:', err.message, '\nStackTrace:', err.stack);

            response = {
                "response": {
                    "status": "Error",
                    "statusDetail": {
                        "code": "RSUI0001",
                        "message": err.message,
                        "messageType": "Error"
                    }
                }
            };
        }

        return response;
    },

    _getLineageEntity: async function (entityId, entityType, relType, paths) {
        paths = paths || [];

        let getRequest = this._createGetRequest(entityId, entityType, relType);
        let getResponse = await this.post("entityservice/get", getRequest);

        if (falcorUtil.isValidObjectPath(getResponse, "response.entities")) {
            let entity = getResponse.response.entities[0];
            entity && (paths.push(entity.name));

            if (falcorUtil.isValidObjectPath(entity, "data.relationships")) {
                entityId = entity.data.relationships[relType][0].relTo.id;
                entityType = entity.data.relationships[relType][0].relTo.type;

                return this._getLineageEntity(entityId, entityType, relType, paths);
            }
        }

        return paths;
    },

    _createGetRequest: function (entityId, entityType, relType) {
        return {
            "params": {
                "query": {
                    "id": entityId,
                    "filters": {
                        "typesCriterion": [
                            entityType
                        ]
                    }
                },
                "fields": {
                    "relationships": [
                        relType
                    ],
                    "attributes": [
                        "externalName"
                    ]
                }
            }
        }
    }
}

module.exports = DataObjectLineageService;
