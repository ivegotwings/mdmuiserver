
require("babel-register");
require("babel-polyfill");
require("hogan.js");

var express = require('express');
var history = require('connect-history-api-fallback');
var cors = require('cors');
var bodyParser = require('body-parser');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var fileUpload = require('express-fileupload');

var config = require('config');

var logger = require('../common/logger/logger-service');
var loggerConfig = config.get('modules.common.logger');
logger.configure(loggerConfig);

var buildPath = process.cwd();
var relativePath = process.env.PROJECT_PATH;

if (relativePath) {
    buildPath = buildPath + '/' + relativePath;
}

logger.info('Web engine start - build path identified', {"buildPath": buildPath});

var app = express();
var http = require('http').Server(app);

app.use(cookieParser());

app.use(compression());

logger.info('Web engine start - compression middleware is loaded');

//We are setting view engine and path for views for express js
app.set('views', buildPath + '/src/views');
app.set('view engine', 'hjs');

logger.info('Web engine start - views are loaded');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}));
app.use(bodyParser.json({limit: '10mb'}));

logger.info('Web engine start - body parser middleware is loaded');

// register cors to allow cross domain calls
app.use(cors());

logger.info('Web engine start - cors middleware is loaded');

//handling root path (specifically for SAML type of authentication)
app.get('/', function (req, res) {
    if (!renderAuthenticatedPage(req, res)) {
        res.render('index', { isAuthenticated: false });
    }
});

logger.info('Web engine start - default location route is loaded');

// register static file content folder path..
app.use(express.static(buildPath, { maxAge: "1s" }));

logger.info('Web engine start - static content routes are loaded');

var contextMgrMiddleware = require('../common/context-manager/middleware');
contextMgrMiddleware(app);

logger.info('Web engine start - context manager middleware is loaded');

//Load falcor api routes
var dataobjectRoute = require('../dataobject/dataobject-router');
dataobjectRoute(app);

logger.info('Web engine start - dataobject service routes are loaded');

var passThroughRoute = require('../pass-through/pass-through-route');
passThroughRoute(app);

logger.info('Web engine start - passthrough service routes are loaded');

var eventServiceRoute = require('../event-service/event-service-route');
eventServiceRoute(app);

logger.info('Web engine start - event service routes are loaded');

var fileDownloadRoute = require('../file-download/file-download-route');
fileDownloadRoute(app);

logger.info('Web engine start - filedownload routes are loaded');

var clientLoggingRoute = require('../ruf-utilities/client-logging-route');
clientLoggingRoute(app);

logger.info('Web engine start - client logger routes are loaded');

var healthCheckRoute = require('../api-healthcheck/api-health-check-route');
healthCheckRoute(app);

logger.info('Web engine start - client logger routes are loaded');

var notificationEngine = require("../notification-engine/socket");
var notificationService = require('../notification-service/notification-route');
notificationService(app);

logger.info('Web engine start - notification service routes are loaded');

var binaryStreamObjectRoute = require('../binarystreamobject/binarystreamobject-route');
binaryStreamObjectRoute(app);

logger.info('Web engine start - binary stream object service routes are loaded');

var binaryObjectRoute = require('../binaryobject/binaryobject-route');
binaryObjectRoute(app);

logger.info('Web engine start - binary object service routes are loaded');

app.use(fileUpload());

var contextMgrMiddleware = require('../common/context-manager/middleware');
contextMgrMiddleware(app);

logger.info('Web engine start - context manager middleware is loaded');

var copRoute = require('../cop/cop-route');
copRoute(app);

logger.info('Web engine start - cop service routes are loaded');

var fileUploadRoute = require('../file-upload/file-upload-route');
fileUploadRoute(app);

logger.info('Web engine start - fileupload routes are loaded');

//register static file root ...index.html..
app.get('*', function (req, res) {
    if (!renderAuthenticatedPage(req, res)) {
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

logger.info('Web engine start - base static file root route is loaded');

function renderAuthenticatedPage(req, res) {
    var userId = req.header("x-rdp-userid");
    var tenantId = req.header("x-rdp-tenantid");
    var userRoles = req.header("x-rdp-userroles");
    var firstName = req.header("x-rdp-firstname");
    var lastName = req.header("x-rdp-lastname");
    var userEmail = req.header("x-rdp-useremail");
    var userName = req.header("x-rdp-username");
    var ownershipData = req.header("x-rdp-ownershipdata");

    if (tenantId && userId) {
        var fullName = "";
        if (firstName) {
            fullName = firstName;
        }
        if (lastName) {
            fullName = fullName + " " + lastName;
        }
        if (fullName == "") {
            fullName = userId;
        }
        res.render('index', { isAuthenticated: true, tenantId: tenantId, userId: userId, roleId: userRoles, fullName: fullName, userName: userName, ownershipData: ownershipData, noPreload: false });
        return true;
    } else {
        return false;
    }
}

logger.info('Web engine start - starting web engine...');

// Finally, start the web server...
var server = app.listen(5005, function () {
    var host = server.address().address === '::' ? 'localhost' : server.address().address;
    var port = server.address().port;
    
    logger.info('Web engine start - web engine is started', {"host": host, "port": port});
    console.log('Web engine is running now at http://%s:%s/', host, port);
});

logger.info('Web engine start - starting notification engine...');

notificationEngine.initSockets(http);

logger.info('Web engine start - notification engine is started');


server.timeout = config.get('modules.webEngine').connectionTimeout;