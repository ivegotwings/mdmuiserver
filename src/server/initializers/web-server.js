
require("babel-register");
require("babel-polyfill");

var express = require('express');
var history = require('connect-history-api-fallback');
var cors = require('cors');
var bodyParser = require('body-parser');
var notificationEngine = require("../modules/notification_engine/Socket");

var buildPath = process.cwd();
var app = express();

console.log('buildPath:', buildPath);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
})); 
app.use(bodyParser.json());

// register cors to allow cross domain calls
app.use(cors());

// register static file content folder path..
app.use(express.static(buildPath, { maxAge: "1s" }));

var contextMgrMiddleware = require('../modules/common/context-manager/middleware'); 
contextMgrMiddleware(app);

//Load falcor api routes
var dataobjectRoute = require('../modules/dataobject/dataobject-router');
dataobjectRoute(app);

var configRoute = require('../modules/config/config-router');
configRoute(app);

var passThroughRoute = require('../modules/pass-through/pass-through-route');
passThroughRoute(app);

var fileUploadRoute = require('../modules/file-upload/file-upload-route');
fileUploadRoute(app);

//register static file root ...index.html..
app.get('*', function (req, res) {
    console.log(JSON.stringify(req.url));
    res.sendFile(buildPath + '/index.html');
});

// app.use(function (err, req, res, next) {
//   console.log('req:', JSON.stringify(req), ' err:', JSON.stringify(err));
// })

// Finally, start the web server...
var server = app.listen(5005, function () {
    var host = server.address().address === '::' ? 'localhost': server.address().address;
    var port = server.address().port;
    
    notificationEngine.initSockets(this);
    console.log('Web app is listening at http://%s:%s/', host, port);
});