
require("babel-register");
require("babel-polyfill");
require("hogan.js");

var express = require('express');
var history = require('connect-history-api-fallback');
var cors = require('cors');
var bodyParser = require('body-parser');
var notificationEngine = require("../modules/notification_engine/Socket");

var buildPath = process.cwd();

var relativePath = process.env.PROJECT_PATH;

if (relativePath) {
    buildPath = buildPath + '/' + relativePath;
}

console.log('buildPath:', buildPath);

var app = express();

//We are setting view engine and path for views for express js
app.set('views', buildPath + '/src/views');
app.set('view engine', 'hjs');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// register cors to allow cross domain calls
app.use(cors());

//handling root path (specifically for SAML type of authentication)
app.get('/', function (req, res) {
    var userId = req.header("x-rdp-userId");
    var tenantId = req.header("x-rdp-tenantId");
    var userRoles = req.header("x-rdp-userRoles");
    if (tenantId && userId) {
        res.render('index', { isAuthenticated: true, tenantId: tenantId, userId: userId, roleId: userRoles });
    }
    else {
         res.render('index', { isAuthenticated: false });
    }
});

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

var copRoute = require('../modules/cop/cop-route');
copRoute(app);

var fileUploadRoute = require('../modules/file-upload/file-upload-route');
fileUploadRoute(app);

var notificationService = require('../modules/notification-service/notification-route');
notificationService(app);

//register static file root ...index.html..
app.get('*', function (req, res) {
    //We are making sure if request is already authenticated by looking at request headers
    var userId = req.header("x-rdp-userId");
    var tenantId = req.header("x-rdp-tenantId");
    var userRoles = req.header("x-rdp-userRoles");
    if (tenantId && tenantId != "" && userId && userId != "") {
        res.render('index', { isAuthenticated: true, tenantId: tenantId, userId: userId, roleId: userRoles });
    }
    else {
        //If request is not authenticated, we are trying see if URL has tenant after root of the URL
        var urlComps = req.url.split('/');
        tenantId = urlComps[0] != "" ? urlComps[0] : urlComps.length > 1 ? urlComps[1] : "";
        //If we find tenant id (assumed tenant id), we set that tenant id in index file
        if (tenantId && tenantId != "") {
            res.render('index', { isAuthenticated: false, tenantId: tenantId });
        }
        else {
            res.render('index', { isAuthenticated: false });
        }
    }
});

// Finally, start the web server...
var server = app.listen(5005, function () {
    var host = server.address().address === '::' ? 'localhost' : server.address().address;
    var port = server.address().port;

    notificationEngine.initSockets(this);
    console.log('Web app is listening at http://%s:%s/', host, port);
});