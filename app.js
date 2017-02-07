'use strict';

require("babel-register");
require("babel-polyfill");

var express = require('express');
var history = require('connect-history-api-fallback');
var cors = require('cors');
var bodyParser = require('body-parser');
var notificationEngine = require("./src/server/notification_engine/Socket");
var buildPath = __dirname;
var app = express();

console.log('buildPath:', buildPath);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
})); 

// register cors to allow cross domain calls
app.use(cors());

// register static file content folder path..
app.use(express.static(buildPath, { maxAge: "1s" }));

//Load falcor api routes
var dataobjectRoute = require('./src/server/api/DataObjectRoutes/dataobject-router');
dataobjectRoute(app);

var configRoute = require('./src/server/api/ConfigService/config-router');
configRoute(app);

var fileUploadRoute = require('./src/server/api/EntityManageService/file-upload-route');
fileUploadRoute(app);

// register static file root ...index.html..
app.get('*', function (req, res) {
    res.sendFile(buildPath + '/index.html');
});

// Finally, start the web server...
var server = app.listen(5005, function () {
    var host = server.address().address === '::' ? 'localhost': server.address().address;
    var port = server.address().port;
    
    notificationEngine.initSockets(this);
    console.log('Web app is listening at http://%s:%s/', host, port);
});