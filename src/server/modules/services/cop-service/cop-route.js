'use strict';
const COPService = require('./COPService');
let uuidV1 = require('uuid/v1');
let options = {};
let runOffline = process.env.RUN_OFFLINE;

if (runOffline) {
    options.runOffline = runOffline;
}

const copService = new COPService(options);

let COPRouter = function (app) {
    app.post('/data/cop/transform', async function (req, res) {
        let response = await copService.transform(req);
        res.status(200).send(response);
    });
    app.post('/data/cop/process', async function (req, res) {
        let response = await copService.process(req);
        //console.log('cop response:', JSON.stringify(response, null, 2));
        res.status(200).send(response);
    });
    app.post('/data/cop/processmodel', async function (req, res) {
        let response = await copService.processmodel(req);
        //console.log('cop response:', JSON.stringify(response, null, 2));
        res.status(200).send(response);
    });
    app.post('/data/cop/processJSON', async function (req, res) {
        let response = await copService.processJSON(req);
        //console.log('cop response:', JSON.stringify(response, null, 2));
        res.status(200).send(response);
    });
    app.post('/data/cop/downloadModelExcel', async function (req, res) {
        copService.downloadModelExcel(req, res);
    });
    app.post('/data/cop/downloadModelJob', async function (req, res) {
        let response = await copService.downloadModelJob(req, res);
        res.status(200).send(response);
    });
    app.post('/data/cop/downloadDataExcel', async function (req, res) {
        copService.downloadDataExcel(req, res);
    });
    app.post('/data/cop/downloadDataJob', async function (req, res) {
        let response = await copService.downloadDataJob(req, res);
         //console.log('cop response:', JSON.stringify(response, null, 2));
        res.status(200).send(response);
    });
    app.post('/data/cop/generateFieldMap', async function (req, res) {
        let response = await copService.generateFieldMap(req);
        //console.log('cop response:', JSON.stringify(response, null, 2));
        res.status(200).send(response);
    });
    app.post('/data/cop/getHeaderFields', async function (req, res) {
        let response = await copService.getHeaderFields(req);
        //console.log('cop response:', JSON.stringify(response, null, 2));
        res.status(200).send(response);
    });
    app.post('/data/cop/getMappings', async function (req, res) {
        let response = await copService.getMappings(req);
        //console.log('cop response:', JSON.stringify(response, null, 2));
        res.status(200).send(response);
    });
    app.post('/data/cop/saveMappings', async function (req, res) {
        let response = await copService.saveMappings(req);
        //console.log('cop response:', JSON.stringify(response, null, 2));
        res.status(200).send(response);
    });
    app.post('/data/cop/publish', async function (req, res) {
        let response = await copService.publish(req);
        res.status(200).send(response);
    });
    app.post('/data/cop/getOverrides', async function (req, res) {
        let response = await copService.getOverrides(req);
        res.status(200).send(response);
    });
    app.post('/data/cop/saveOverrides', async function (req, res) {
        let response = await copService.saveOverrides(req);
        res.status(200).send(response);
    });
};

module.exports = function (app) {
    return new COPRouter(app);
};
