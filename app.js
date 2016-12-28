'use strict';

require("babel-register");
require("babel-polyfill");

var express = require('express');
var history = require('connect-history-api-fallback');
var cors = require('cors');
var bodyParser = require('body-parser');
var notificationEngine = require("./src/server/notification_engine/Socket");

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cors());

//Load falcor routes
var entityRoute = require('./src/server/api/EntityManageService/router');
var fileUploadRoute = require('./src/server/api/EntityManageService/file-upload-route');

var buildPath = __dirname;
//console.log(buildPath);

//var oneDay = 86400000;

app.use(express.static(buildPath, {
    maxAge: "1s"
}));

entityRoute(app);

fileUploadRoute(app);

app.get('*', function (req, res) {
    res.sendFile(buildPath + '/index.html');
});


var server = app.listen(5005, function () {
    var host = server.address().address === '::' ? 'localhost': server.address().address;
    var port = server.address().port;
    
    notificationEngine.initSockets(this);
    console.log('Web app is listening at http://%s:%s/', host, port);
});