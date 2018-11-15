'use strict';
const PassThroughService = require('./PassThroughService');
const EntityCompositeModelService = require('../model-service/EntityCompositeModelGetService');
let middlewares = require('./../../../middlewares');
let options = {};
let runOffline = process.env.RUN_OFFLINE;

if(runOffline) {
    options.runOffline = runOffline;
}

const passThroughService = new PassThroughService(options);
const entityCompositeModelService = new EntityCompositeModelService(options);

let PassThroughRouter = function (app) {
    app.post('/data/pass-through/*', middlewares.urlValidator, async function (req, res) {
        
        // var responseContent = "";
        // Object.keys(req).forEach(function(key){
        //     responseContent += (key + ": " + req[key]+ "<br>\n" );
        // });
        //console.log(responseContent);
        // res.status(200).send(responseContent);
        //console.log('serving by pass-through handler');
        //console.log('req.query: ', req.query);
        //console.log('req.body: ', req.body);
        
        let response = await passThroughService.call(req);
        res.status(200).send(response);

    });
    app.post('/pass-through-bulk/matchservice/search', middlewares.urlValidator, async function (req, res) {
        let response = await passThroughService.bulkCall(req);
        res.status(200).send(response);
    });
    app.post('/pass-through-bulk/entitygovernservice/workflowChangeAssignment', middlewares.urlValidator, async function (req, res) {
        let response = await passThroughService.bulkCall(req);
        res.status(200).send(response);
    });
    app.post('/pass-through-bulk/entitygovernservice/transitionWorkflow', middlewares.urlValidator, async function (req, res) {
        let response = await passThroughService.bulkCall(req);
        res.status(200).send(response);
    });
    app.post('/pass-through-bulk/entitygovernservice/validate', middlewares.urlValidator, async function (req, res) {
        let response = await passThroughService.bulkCall(req);
        res.status(200).send(response);
    });
    app.post('/data/pass-through-combined-query/bulkentityservice/createtask', middlewares.urlValidator, async function (req, res) {
        let response = await passThroughService.createTaskForCombinedQuery(req);
        res.status(200).send(response);
    });
    app.post('/pass-through-deploytenantseed/adminservice/deploytenantseed', middlewares.urlValidator, async function (req, res) {
        let response = await passThroughService.deployTenantSeedCall(req);
        res.status(200).send(response);
    });
    app.post('/data/pass-through-snapshot/*', middlewares.urlValidator, async function (req, res) {
        let response = await passThroughService.snapshotCall(req);
        res.status(200).send(response);
    });
    app.post('/data/pass-through-model/compositemodelget', middlewares.urlValidator, async function(req, res) {
        let response = await entityCompositeModelService.get(req.body);
        res.status(200).send(response);
    });
};

module.exports = function (app) {
    return new PassThroughRouter(app);
};
