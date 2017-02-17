'use strict';
const PassThroughService = require('./PassThroughService');
var options = {};
var runOffline = process.env.RUN_OFFLINE;

if(runOffline) {
    options.runOffline = runOffline;
}

const passThroughService = new PassThroughService(options);

var PassThroughRouter = function (app) {
    app.get('/pass-through/*', function (req, res) {
        // var responseContent = "";
        // Object.keys(req).forEach(function(key){
        //     responseContent += (key + ": " + req[key]+ "<br>" );
        // });
        // res.status(200).send(responseContent);
        console.log('serving by pass-through handler');

        var response = passThroughService.post(req);
        res.status(200).send(response);

    });
};

module.exports = function (app) {
    return new PassThroughRouter(app);
};
