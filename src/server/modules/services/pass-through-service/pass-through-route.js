'use strict';
const PassThroughService = require('./PassThroughService');
let options = {};
let runOffline = process.env.RUN_OFFLINE;

if(runOffline) {
    options.runOffline = runOffline;
}

const passThroughService = new PassThroughService(options);

let PassThroughRouter = function (app) {
    app.post('/data/pass-through/*', async function (req, res) {
        
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
    app.post('/pass-through-bulk/matchservice/search', async function (req, res) {
        let response = await passThroughService.bulkCall(req);
        res.status(200).send(response);
    });
    app.post('/pass-through-bulk/entitygovernservice/workflowChangeAssignment', async function (req, res) {
        let response = await passThroughService.bulkCall(req);
        res.status(200).send(response);
    });
    app.post('/pass-through-bulk/entitygovernservice/transitionWorkflow', async function (req, res) {
        let response = await passThroughService.bulkCall(req);
        res.status(200).send(response);
    });
    app.post('/pass-through-bulk/entitygovernservice/validate', async function (req, res) {
        let response = await passThroughService.bulkCall(req);
        res.status(200).send(response);
    });
    app.post('/data/pass-through-combined-query/bulkentityservice/createtask', async function (req, res) {
        let response = await passThroughService.createTaskForCombinedQuery(req);
        res.status(200).send(response);
    });
    app.post('/data/pass-through-snapshot/*', async function (req, res) {
        let response = await passThroughService.snapshotCall(req);
        res.status(200).send(response);
    });
};

module.exports = function (app) {
    return new PassThroughRouter(app);
};
