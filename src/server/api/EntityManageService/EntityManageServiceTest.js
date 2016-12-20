'use strict';

var EntityManageService = require('./EntityManageService');

function testOfflineInitialization(){
    var entityManageService = new EntityManageService({mode:"offline"});
}


function testOfflineGetEntitiesForSingleId(){
    console.log('testOfflineGetEntitiesForSingleId started..');
    var entityManageService = new EntityManageService({mode:"offline"});

    var request = {
            "query":{
                "ctx":[
                    {
                        "list":"productMaster",
                        "classification":"nivea/niveaBodyCare/niveaBody/nbodyEssential/nbody/ess/nourishingMilkDry"
                    }
                ],
                "valCtx":[
                    {
                        "source":"SAP",
                        "locale":"en-US"
                    }
                ],
                "id":"e1",
                "filters":{
                    "attributesCriterion":[],
                    "typesCriterion":["nart"]
                }
            },
            "fields":{
                "ctxTypes":["properties"],
                "attributes":["cpimProductName","csapDescriptionOfNart"],
                "relationships":["ALL"]
            }
        };

    var response = entityManageService.getEntities(request);

    console.log(JSON.stringify(response));

    console.log('testOfflineGetEntitiesForSingleId completed..');
    
}

function testOfflineGetEntitiesForRandomSearchResult(){
    console.log('testOfflineGetEntitiesForRandomSearchResult started..');
    var entityManageService = new EntityManageService({mode:"offline"});

    var request = {
            "query":{
                "ctx":[
                    {
                        "list":"productMaster",
                        "classification":"nivea/niveaBodyCare/niveaBody/nbodyEssential/nbody/ess/nourishingMilkDry"
                    }
                ],
                "valCtx":[
                    {
                        "source":"SAP",
                        "locale":"en-US"
                    }
                ],
                "filters":{
                    "attributesCriterion":[],
                    "typesCriterion":["nart"]
                }
            },
            "fields":{
                "ctxTypes":["properties"],
                "attributes":["cpimProductName","csapDescriptionOfNart"],
                "relationships":["ALL"]
            }
        };

    var response = entityManageService.getEntities(request);

    console.log(JSON.stringify(response));

    console.log('testOfflineGetEntitiesForRandomSearchResult completed..');
    
}

//console.log(JSON.stringify(response, null, 4));

//console.log(JSON.stringify(response, null, 4));

module.exports = {
     testOfflineInitialization: testOfflineInitialization,
     testOfflineGetEntitiesForSingleId: testOfflineGetEntitiesForSingleId,
     testOfflineGetEntitiesForRandomSearchResult: testOfflineGetEntitiesForRandomSearchResult
};

module.exports = new function(){
    testOfflineGetEntitiesForSingleId();
}











