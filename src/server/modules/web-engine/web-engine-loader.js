//require("babel-register");
//require("babel-polyfill");
require("hogan.js");

var express = require('express');
var history = require('connect-history-api-fallback');
var cors = require('cors');
var bodyParser = require('body-parser');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var fileUpload = require('express-fileupload');
var path = require("path");
var RuntimeVersionManager = require('../version-service/RuntimeVersionManager');
var ModuleVersionManager = require('../version-service/ModuleVersionManager');

var config = require('config');

var logger = require('../common/logger/logger-service');
var loggerConfig = config.get('modules.common.logger');
logger.configure(loggerConfig);

var buildPath = process.cwd();

var relativePath = process.env.PROJECT_PATH;
//relativePath = '.';
var isNodMonitorProcess = false;

if (process.env.NODE_MON_PROCESS) {
    isNodMonitorProcess = true;
}

//console.log('Node env', process.env);

if (relativePath) {
    buildPath = buildPath + '/' + relativePath;
}

console.log('build path: ', buildPath);
logger.info('Web engine start - build path identified', { "buildPath": buildPath });

var pjson = require(buildPath + '/package.json');
const buildVersion = pjson.version;
RuntimeVersionManager.initialize(buildVersion);
ModuleVersionManager.initialize();

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
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
app.use(bodyParser.json({ limit: '10mb' }));

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

var loggerRoute = require('../common/logger/logger-route');
loggerRoute(app);

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

var versionRoute = require('../version-service/version-route');
versionRoute(app);

logger.info('Web engine start - version routes are loaded');
//app.use(express.static(path.join(buildPath, "/build/ui-platform/static/es6-bundled"), { maxAge: "1s" }));
app.use(express.static(buildPath, { maxAge: "1s" }));

//register static file root ...index.html..
app.get('*', function (req, res) {
    var isES5 = (req.headers['user-agent'].indexOf('rv:11') !== -1);
    var userId = req.header("x-rdp-userid");
    var tenantId = req.header("x-rdp-tenantid");
    if (tenantId && userId) {
        var url = req.url;
        var urlRedirected = false;

        if (url.indexOf(tenantId) > -1) {
            url = url.replace("/" + tenantId + "/", "");
        }

        if (isNodMonitorProcess && isES5) {
            res.write("ES5 mode is not supported with local development run. Please execute production build using pm2");
            res.sendStatus(402);
            return;
        }

        if (!isNodMonitorProcess) {
            var staticPath = isES5 ? "/../static/es5-bundled" : "/../static/es6-bundled";
            
            if (req.url.indexOf("/bower_components/") > -1) {
                url = req.url.replace("/bower_components/", staticPath + "/bower_components/");
                urlRedirected = true;
            }
            else if (req.url.indexOf("/src/") > -1) {
                url = req.url.replace("/src/", staticPath + "/src/");
                urlRedirected = true;
            }
            else if (req.url.indexOf("/service-worker.js") > -1) {
                url = req.url.replace("/service-worker.js", staticPath + "/service-worker.js");
                urlRedirected = true;
            }
            else if (req.url.indexOf("/manifest.json") > -1) {
                url = req.url.replace("/manifest.json", staticPath + "/manifest.json");
                urlRedirected = true;
            }

            //console.log('url prepared ', url);
        }
        
        //console.log('url requested ', url, urlRedirected);

        if (urlRedirected) {
            //console.log('url requested ', url);
            if (url.indexOf("?") > -1) {
                url = url.split("?")[0];
            }
            res.sendFile(path.join(buildPath, url));
            return;
        }
    }
    if (!renderAuthenticatedPage(req, res)) {
        console.log('sending non-authenticated index page');
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

async function renderAuthenticatedPage(req, res) {
    var userId = req.header("x-rdp-userid");
    var tenantId = req.header("x-rdp-tenantid");
    var userRoles = req.header("x-rdp-userroles");
    var firstName = req.header("x-rdp-firstname");
    var lastName = req.header("x-rdp-lastname");
    var userEmail = req.header("x-rdp-useremail");
    var userName = req.header("x-rdp-username");
    var ownershipData = req.header("x-rdp-ownershipdata");
    var ownershipeditdata = req.header("x-rdp-ownershipeditdata");

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

        var noPreload = true;

        var versionInfo = {
            'buildVersion': await RuntimeVersionManager.getBuildVersion(),
            'runtimeVersion': await RuntimeVersionManager.getVersion(),
            'moduleVersions': ModuleVersionManager.getAll()
        }

        //console.log('version info: ', JSON.stringify(versionInfo, null, 2));

        res.render('index', 
            {
                isAuthenticated: true, 
                tenantId: tenantId, 
                userId: userId, 
                roleId: userRoles,
                fullName: fullName, 
                userName: userName, 
                ownershipData: ownershipData,
                ownershipeditdata: ownershipeditdata,
                noPreload: noPreload,
                versionInfo: JSON.stringify(versionInfo)
            });

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

    logger.info('Web engine start - web engine is started', { "host": host, "port": port });
    console.log('Web engine is running now at http://%s:%s/', host, port);
});

logger.info('Web engine start - starting notification engine...');

notificationEngine.initSockets(server);

logger.info('Web engine start - notification engine is started');


server.timeout = config.get('modules.webEngine').connectionTimeout;

