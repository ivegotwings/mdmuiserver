'use strict';
const BinaryObjectService = require('./BinaryObjectService');
var options = {};
var runOffline = process.env.RUN_OFFLINE;

if (runOffline) {
    options.runOffline = runOffline;
}

const binaryObjectService = new BinaryObjectService(options);

var BinaryObjectRouter = function (app) {
    app.post('/data/binaryobjectservice/downloadBinaryObject', async function (req, res) {
        binaryObjectService.downloadBinaryObject(req, res);
    });
};

module.exports = function (app) {
    return new BinaryObjectRouter(app);
};