
require("babel-register");
require("babel-polyfill");
require("hogan.js");

var express = require('express');
var history = require('connect-history-api-fallback');
var cors = require('cors');
var bodyParser = require('body-parser');
var compression = require('compression');

var notificationEngine = require("../modules/notification-engine/socket");

var buildPath = process.cwd();

var relativePath = process.env.PROJECT_PATH;

if (relativePath) {
    buildPath = buildPath + '/' + relativePath;
}

console.log('buildPath:', buildPath);

var app = express();

app.use(compression());

//We are setting view engine and path for views for express js
app.set('views', buildPath + '/src/views');
app.set('view engine', 'hjs');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// register cors to allow cross domain calls
app.use(cors());


//handling root path (specifically for SAML type of authentication)
app.get('/', function (req, res) {
    if (!renderAuthenticatedPage(req, res)) {
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

var passThroughRoute = require('../modules/pass-through/pass-through-route');
passThroughRoute(app);

var copRoute = require('../modules/cop/cop-route');
copRoute(app);

var fileUploadRoute = require('../modules/file-upload/file-upload-route');
fileUploadRoute(app);

var fileDownloadRoute = require('../modules/file-download/file-download-route');
fileDownloadRoute(app);

var notificationService = require('../modules/notification-service/notification-route');
notificationService(app);

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

function renderAuthenticatedPage(req, res) {
    var userId = req.header("x-rdp-userid");
    var tenantId = req.header("x-rdp-tenantid");
    var userRoles = req.header("x-rdp-userroles");
    var firstName = req.header("x-rdp-firstname");
    var lastName = req.header("x-rdp-lastname");
    var userEmail = req.header("x-rdp-useremail");
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
        res.render('index', { isAuthenticated: true, tenantId: tenantId, userId: userId, roleId: userRoles, fullName: fullName });
        return true;
    } else {
        return false;
    }
}
// Finally, start the web server...
var server = app.listen(5005, function () {
    var host = server.address().address === '::' ? 'localhost' : server.address().address;
    var port = server.address().port;

    notificationEngine.initSockets(this);
    console.log('Web app is listening at http://%s:%s/', host, port);
});