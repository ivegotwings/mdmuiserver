'use strict';
const COPService = require('./COPService');
var uuidV1 = require('uuid/v1');
var options = {};
var runOffline = process.env.RUN_OFFLINE;

if (runOffline) {
    options.runOffline = runOffline;
}

const copService = new COPService(options);

var COPRouter = function (app) {
    app.post('/data/cop/transform', async function (req, res) {
        var response = await copService.transform(req);
        res.status(200).send(response);
    });
    app.post('/data/cop/process', async function (req, res) {
        var response = await copService.process(req);
        //console.log('cop response:', JSON.stringify(response, null, 2));
        res.status(200).send(response);
    });
    app.post('/data/cop/processmodel', async function (req, res) {
        var response = await copService.processmodel(req);
        //console.log('cop response:', JSON.stringify(response, null, 2));
        res.status(200).send(response);
    });
    app.post('/data/cop/downloadModelExcel', async function (req, res) {
        copService.downloadModelExcel(req, res);
    });
    app.post('/data/cop/downloadDataExcel', async function (req, res) {
        copService.downloadDataExcel(req, res);
    });
    app.post('/data/cop/generateFieldMap', async function (req, res) {
        var response = await copService.generateFieldMap(req);
        //console.log('cop response:', JSON.stringify(response, null, 2));
        res.status(200).send(response);
    });
    app.post('/data/cop/publish', async function (req, res) {
        var response = await copService.publish(req);
        res.status(200).send(response);
    });
};

module.exports = function (app) {
    return new COPRouter(app);
};
