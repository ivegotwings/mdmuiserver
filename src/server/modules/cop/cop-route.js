'use strict';
const COPService = require('./COPService');
var options = {};
var runOffline = process.env.RUN_OFFLINE;

if(runOffline) {
    options.runOffline = runOffline;
}

const copService = new COPService(options);

var COPRouter = function (app) {
    app.post('/cop/transform', async function (req, res) {
        var response = await copService.transform(req);
        res.status(200).send(response);

    });
};

module.exports = function (app) {
    return new COPRouter(app);
};
