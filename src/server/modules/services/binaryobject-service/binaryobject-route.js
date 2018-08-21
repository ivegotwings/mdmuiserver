'use strict';
const BinaryObjectService = require('./BinaryObjectService');
let options = {};
let runOffline = process.env.RUN_OFFLINE;

if (runOffline) {
    options.runOffline = runOffline;
}

const binaryObjectService = new BinaryObjectService(options);

let BinaryObjectRouter = function (app) {
    app.post('/data/binaryobjectservice/downloadBinaryObject', async function (req, res) {
        binaryObjectService.downloadBinaryObject(req, res);
    });
};

module.exports = function (app) {
    return new BinaryObjectRouter(app);
};