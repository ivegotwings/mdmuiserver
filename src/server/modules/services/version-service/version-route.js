'use strict';
const VersionService = require('./VersionService');
let RuntimeVersionManager = require('./RuntimeVersionManager');

let options = {};
let runOffline = process.env.RUN_OFFLINE;

if (runOffline) {
    options.runOffline = runOffline;
}

const versionService = new VersionService(options);

let VersionRouter = function (app) {
    app.use('/data/version/updateRuntimeVersion', async function (req, res) {
        let response = await versionService.updateRuntimeVersion(req);
        res.status(200).send(response);
    });

    app.use('/access_check/ui_server', async function (req, res) {
        let version = await RuntimeVersionManager.getVersion();
        let response = {
            "status": "OK",
            "version": version,
            "tag": "Make Data Matter"
        };

        res.status(200).send(JSON.stringify(response));
    });
};

module.exports = function (app) {
    return new VersionRouter(app);
};
