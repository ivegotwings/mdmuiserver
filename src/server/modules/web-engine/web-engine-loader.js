
let express = require('express');
let history = require('connect-history-api-fallback');
let cors = require('cors');
let bodyParser = require('body-parser');
let compression = require('compression');
let cookieParser = require('cookie-parser');
let fileUpload = require('express-fileupload');
let path = require("path");
let RuntimeVersionManager = require('../services/version-service/RuntimeVersionManager');

let config = require('config');

let logger = require('../common/logger/logger-service');
let loggerConfig = config.get('modules.common.logger');
logger.configure(loggerConfig);

let buildPath = process.cwd();

let relativePath = process.env.PROJECT_PATH;
//relativePath = '.';

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

logger.info('Web engine start - cors middleware is loaded');

let contextMgrMiddleware = require('../common/context-manager/middleware');
contextMgrMiddleware(app);

logger.info('Web engine start - context manager middleware is loaded');

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

// app.use(express.static(buildPath + '/build/static/es6-bundled-dev', {
//     maxAge: "1s"
// }));

let uiAppServiceRoute = require('../services/ui-app-service/ui-app-service-route');
uiAppServiceRoute(app);

logger.info('Web engine start - user info route is loaded');

//register static file root ...index.html..
app.get('/*', function (req, res) {
    let isES5;
    let userDefaults = config.get("modules.userDefaults");

    let userId = req.header("x-rdp-userid") || userDefaults.userId;
    let tenantId = req.header("x-rdp-tenantid") || userDefaults.tenantId;
    if (req.headers && req.headers['user-agent']) {
        isES5 = (req.headers['user-agent'].indexOf('rv:11') !== -1);
    }

    if (tenantId && userId) {
        let url = req.url;
        let urlRedirected = false;

        if (isES5) {
            res.write("ES5 mode is not supported with local development run. Please execute production build using pm2");
            res.sendStatus(402);
            return;
        }

        if (url.indexOf(tenantId) > -1) {
            url = url.replace("/" + tenantId, "");
        }

        let staticPath = "../static/es6-bundled";

        if (url.indexOf("/node_modules/") > -1) {
            url = url.replace("/node_modules/", staticPath + "/node_modules/");
            urlRedirected = true;
        } else if (url.indexOf("/vendor/") > -1) {

            url = url.replace("/vendor/", staticPath + "/vendor/");
            urlRedirected = true;
        } else if (url.indexOf("/src/") > -1) {
            url = url.replace("/src/", staticPath + "/src/");
            urlRedirected = true;
        } else if (url.indexOf("/service-worker.js") > -1) {
            url = url.replace("/service-worker.js", staticPath + "/service-worker.js");
            urlRedirected = true;
        } else if (url.indexOf("/manifest.json") > -1) {
            url = url.replace("/manifest.json", staticPath + "/manifest.json");
            urlRedirected = true;
        }

        if (urlRedirected) {
            if (url.indexOf("?") > -1) {
                url = url.split("?")[0];
            }
            res.sendFile(path.join(buildPath, url));
            return;
        }
        res.sendFile(path.join(buildPath + staticPath + "/index.html"));
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