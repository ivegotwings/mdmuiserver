'use strict';
const UIAppService = require('./UIAppService');
let options = {};
let runOffline = process.env.RUN_OFFLINE;

if (runOffline) {
    options.runOffline = runOffline;
}

const appService = new UIAppService(options);

let UIAppServiceRouter = function (app) {
    app.get('/data/appservice/baseinfo/get', function (req, res) {
        appService.getBaseInfo(req, res);
    });
};

module.exports = function (app) {
    return new UIAppServiceRouter(app);
};
