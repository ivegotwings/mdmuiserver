'use strict';
const BinaryStreamObjectService = require('./BinaryStreamObjectService');
let options = {};
let runOffline = process.env.RUN_OFFLINE;

if (runOffline) {
    options.runOffline = runOffline;
}

const binaryStreamObjectService = new BinaryStreamObjectService(options);

let BinaryStreamObjectRouter = function (app) {
    app.post('/data/binarystreamobjectservice/prepareUpload', async function (req, res) {
        let response = await binaryStreamObjectService.prepareUpload(req);
        //console.log('prepare upload response:', JSON.stringify(response, null, 2));
        res.status(200).send(response);
    });

    app.post('/data/binarystreamobjectservice/prepareDownload', async function (req, res) {
        let response = await binaryStreamObjectService.prepareDownload(req);
        //console.log('prepare download response:', JSON.stringify(response, null, 2));
        res.status(200).send(response);
    });

    app.post('/data/binarystreamobjectservice/create', async function (req, res) {
        let response = await binaryStreamObjectService.create(req);
        //console.log('create response:', JSON.stringify(response, null, 2));
        res.status(200).send(response);
    });
};

module.exports = function (app) {
    return new BinaryStreamObjectRouter(app);
};