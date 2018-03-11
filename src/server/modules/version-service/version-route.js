'use strict';
const VersionService = require('./VersionService');
var options = {};
var runOffline = process.env.RUN_OFFLINE;

if (runOffline) {
    options.runOffline = runOffline;
}

const versionService = new VersionService(options);

var VersionRouter = function (app) {
    app.use('/data/version/updateRuntimeVersion', async function (req, res) {
        var response = await versionService.updateRuntimeVersion(req);
        res.status(200).send(response);
    });
};

module.exports = function (app) {
    return new VersionRouter(app);
};
