//require("babel-register");
//require("babel-polyfill");
require("hogan.js");

let express = require('express');
let history = require('connect-history-api-fallback');
let cors = require('cors');
let bodyParser = require('body-parser');
let compression = require('compression');
let cookieParser = require('cookie-parser');
let fileUpload = require('express-fileupload');
let path = require("path");
let RuntimeVersionManager = require('../services/version-service/RuntimeVersionManager');
let ModuleVersionManager = require('../services/version-service/ModuleVersionManager');
let executionContext = require('../common/context-manager/execution-context');
let middlewares = require('../../middlewares');

let config = require('config');

let logger = require('../common/logger/logger-service');
let loggerConfig = config.get('modules.common.logger');
logger.configure(loggerConfig);

let buildPath = process.cwd();

let relativePath = process.env.PROJECT_PATH;
//relativePath = '.';
let isNodMonitorProcess = false;

if (process.env.NODE_MON_PROCESS) {
    isNodMonitorProcess = true;
}

//console.log('Node env', process.env);

if (relativePath) {
    buildPath = buildPath + '/' + relativePath;
}

console.log('build path: ', buildPath);
logger.info('Web engine start - build path identified', {
    "buildPath": buildPath
});

const buildVersion = config.get('modules.versionService.buildVersion');
RuntimeVersionManager.initialize(buildVersion);

let app = express();
let http = require('http').Server(app);

app.use(cookieParser());

app.use(compression());

logger.info('Web engine start - compression middleware is loaded');

//We are setting view engine and path for views for express js
app.set('views', buildPath + '/src/views');
app.set('view engine', 'hjs');

logger.info('Web engine start - views are loaded');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: false
}));
app.use(bodyParser.json({
    limit: '50mb'
}));

logger.info('Web engine start - body parser middleware is loaded');

// register cors to allow cross domain calls
app.use(cors());

// validate url 
app.use(middlewares.urlValidator);

logger.info('Web engine start - cors middleware is loaded');

let contextMgrMiddleware = require('../common/context-manager/middleware');
contextMgrMiddleware(app);

logger.info('Web engine start - context manager middleware is loaded');

//handling root path (specifically for SAML type of authentication)
app.get('/', function (req, res) {
    if (!renderAuthenticatedPage(req, res)) {
        res.render('index', {
            isAuthenticated: false
        });
    }
});

logger.info('Web engine start - default location route is loaded');

//Load falcor api routes
let dataobjectRoute = require('../dataobject/dataobject-router');
dataobjectRoute(app);

logger.info('Web engine start - dataobject service routes are loaded');

let passThroughRoute = require('../services/pass-through-service/pass-through-route');
passThroughRoute(app);

logger.info('Web engine start - passthrough service routes are loaded');

let eventServiceRoute = require('../services/event-service/event-service-route');
eventServiceRoute(app);

logger.info('Web engine start - event service routes are loaded');

let fileDownloadRoute = require('../file-download/file-download-route');
fileDownloadRoute(app);

logger.info('Web engine start - filedownload routes are loaded');

let loggerRoute = require('../common/logger/logger-route');
loggerRoute(app);

logger.info('Web engine start - client logger routes are loaded');

let healthCheckRoute = require('../api-healthcheck/api-health-check-route');
healthCheckRoute(app);

let notificationEngine = require("../notification-engine/socket");
let notificationService = require('../services/notification-service/notification-route');
notificationService(app);

logger.info('Web engine start - notification service routes are loaded');

let binaryStreamObjectRoute = require('../services/binarystreamobject-service/binarystreamobject-route');
binaryStreamObjectRoute(app);

logger.info('Web engine start - binary stream object service routes are loaded');

let binaryObjectRoute = require('../services/binaryobject-service/binaryobject-route');
binaryObjectRoute(app);

logger.info('Web engine start - binary object service routes are loaded');

app.use(fileUpload());

// Fileupload middleware is resetting the cls session hence we need to reload the contextMgr middleware again
contextMgrMiddleware(app);

let copRoute = require('../services/cop-service/cop-route');
copRoute(app);

logger.info('Web engine start - cop service routes are loaded');

let fileUploadRoute = require('../file-upload/file-upload-route');
fileUploadRoute(app);

logger.info('Web engine start - fileupload routes are loaded');

let versionRoute = require('../services/version-service/version-route');
versionRoute(app);

logger.info('Web engine start - version routes are loaded');
//app.use(express.static(path.join(buildPath, "/build/ui-platform/static/es6-bundled"), { maxAge: "1s" }));
app.use(express.static(buildPath, {
    maxAge: "1s"
}));

//register static file root ...index.html..
app.get('*', function (req, res) {
    let isES5;
    let userId = req.header("x-rdp-userid");
    let tenantId = req.header("x-rdp-tenantid");
    if(req.headers && req.headers['user-agent']){
        isES5 = (req.headers['user-agent'].indexOf('rv:11') !== -1);
    }
    if (tenantId && userId) {
        let url = req.url;
        let urlRedirected = false;

        if (url.indexOf(tenantId) > -1) {
            url = url.replace("/" + tenantId + "/", "");
        }

        if (isNodMonitorProcess && isES5) {
            res.write("ES5 mode is not supported with local development run. Please execute production build using pm2");
            res.sendStatus(402);
            return;
        }

        if (!isNodMonitorProcess) {
            let staticPath = isES5 ? "/../static/es5-bundled" : "/../static/es6-bundled";

            if (req.url.indexOf("/bower_components/") > -1) {
                url = req.url.replace("/bower_components/", staticPath + "/bower_components/");
                urlRedirected = true;
            } else if (req.url.indexOf("/src/") > -1) {
                url = req.url.replace("/src/", staticPath + "/src/");
                urlRedirected = true;
            } else if (req.url.indexOf("/service-worker.js") > -1) {
                url = req.url.replace("/service-worker.js", staticPath + "/service-worker.js");
                urlRedirected = true;
            } else if (req.url.indexOf("/manifest.json") > -1) {
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
        let urlComps = req.url.split('/');
        tenantId = urlComps[0] != "" ? urlComps[0] : urlComps.length > 1 ? urlComps[1] : "";
        //If we find tenant id (assumed tenant id), we set that tenant id in index file
        if (tenantId && tenantId != "") {
            res.render('index', {
                isAuthenticated: false,
                tenantId: tenantId
            });
        } else {
            res.render('index', {
                isAuthenticated: false
            });
        }
    }
});

logger.info('Web engine start - base static file root route is loaded');

logger.info('Web engine start - starting web engine...');

// Finally, start the web server...
let server = app.listen(5005, function () {
    let host = server.address().address === '::' ? 'localhost' : server.address().address;
    let port = server.address().port;

    logger.info('Web engine start - web engine is started', {
        "host": host,
        "port": port
    });
    console.log('Web engine is running now at http://%s:%s/', host, port);
});

logger.info('Web engine start - starting notification engine...');

notificationEngine.initSockets(server);

logger.info('Web engine start - notification engine is started');

server.timeout = config.get('modules.webEngine').connectionTimeout;

async function renderAuthenticatedPage(req, res) {
    let userId = req.header("x-rdp-userid");
    let tenantId = req.header("x-rdp-tenantid");

    if (tenantId && userId) {
        let securityContext = executionContext.getSecurityContext();
        
        if (securityContext && securityContext.headers && securityContext.headers.userRoles) {
            
            let secHeaders = securityContext.headers;

            let noPreload = true;

            let versionInfo = {
                'buildVersion': await RuntimeVersionManager.getBuildVersion(),
                'runtimeVersion': await RuntimeVersionManager.getVersion(),
                'moduleVersions': await ModuleVersionManager.getAll(tenantId)
            }

            let userContext = {
                "roles": secHeaders.userRoles,
                "user": userId,
                "defaultRole": secHeaders.defaultRole,
                "tenant": tenantId,
                "userName": secHeaders.userName,
                "userFullName": secHeaders.fullName,
                "isAuthenticated": true
            };

            let baseContextData = {
                "UserContexts": [userContext]
            };

            //console.log('version info: ', JSON.stringify(versionInfo, null, 2));

            res.render('index', {
                isAuthenticated: true,
                tenantId: tenantId,
                userId: userId,
                roles: secHeaders.userRoles,
                defaultRole: secHeaders.defaultRole,
                fullName: secHeaders.fullName,
                userName: secHeaders.userName,
                ownershipData: secHeaders.ownershipData,
                ownershipeditdata: secHeaders.ownershipeditdata,
                noPreload: noPreload,
                versionInfo: JSON.stringify(versionInfo),
                baseContextData: JSON.stringify(baseContextData)
            });

            return true;
        }
        else {
            //TODO: generate error page for browser
            console.error('security context is not yet ready');
        }
    } else {
        return false;
    }
}
