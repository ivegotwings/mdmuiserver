'use strict';
const AssetService = require('./AssetService');
var options = {};
var runOffline = process.env.RUN_OFFLINE;

if (runOffline) {
    options.runOffline = runOffline;
}

const assetService = new AssetService(options);

var AssetRouter = function (app) {
    app.post('/asset/upload', async function (req, res) {
        var response = await assetService.upload(req);
        //console.log('upload response:', JSON.stringify(response, null, 2));
        res.status(200).send(response);
    });
};

module.exports = function (app) {
    return new AssetRouter(app);
};