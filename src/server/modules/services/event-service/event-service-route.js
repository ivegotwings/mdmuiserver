'use strict';
const EventService = require('./EventService');
var options = {};
var runOffline = process.env.RUN_OFFLINE;

if (runOffline) {
    options.runOffline = runOffline;
}

const eventService = new EventService(options);

var EventDataRouter = function (app) {
    app.post('/data/eventservice/get', async function (req, res) {
        var response = await eventService.get(req);
        //console.log('prepare upload response:', JSON.stringify(response, null, 2));
        res.status(200).send(response);
    });

    app.post('/data/eventservice/getTaskdetails', async function (req, res) {
        var response = await eventService.getTaskDetails(req);
        //console.log('prepare upload response:', JSON.stringify(response, null, 2));
        res.status(200).send(response);
    });
};

module.exports = function (app) {
    return new EventDataRouter(app);
};