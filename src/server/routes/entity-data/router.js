'use strict';

var falcorExpress = require('falcor-express'),
    Router = require('falcor-router'),
    flatten = require('flatten'),
    Promise = require('promise'),
    jsonGraph = require('falcor-json-graph'),
    uuidV1 = require('uuid/v1'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error,
    $atom = jsonGraph.atom,
    fileUpload = require('express-fileupload'),
    fs = require('fs'),
    expireTime = -60 * 60 * 1000; // 60 mins

var resolver = require('../entity-data/route-resolver');

var EntityManageService = require('../../api/EntityManageService/EntityManageService');

var EntityRouterBase = Router.createClass([
    {
        route: 'searchResults.create',
        call: (callPath, args) => resolver.initiateSearchRequest(callPath, args)
    },
    {
        route: 'searchResults[{keys:requestIds}].entities[{ranges:entityRanges}]',
        get: (pathSet) => resolver.getSearchResultDetail(pathSet)
    },
    {
        route: "entitiesById[{keys:entityIds}].data.ctxInfo[{keys:ctxKeys}].attributes[{keys:attrNames}].values",
        get: (pathSet) => resolver.getEntities(pathSet)
    },
    {
       
        route: "entitiesById[{keys:entityIds}][{keys:entityFields}]",
        get: (pathSet) => resolver.getEntities(pathSet)
    }
]);

var EntityRouter = function() {
    EntityRouterBase.call(this);
};

EntityRouter.prototype = Object.create(EntityRouterBase.prototype);

module.exports = function() {
    return new EntityRouter();
};

module.exports = function(app) {
    app.use('/entityData.json',
        falcorExpress.dataSourceRoute(function(req, res) {
            return new EntityRouter();
        }));
};

module.exports = function(app) {
    app.use(fileUpload());
    var dir = './upload';

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    app.post('/file-upload',function(req, res) {
            if (!req.files) {
                res.send('No files were uploaded.');
                return;
            }
            var file = req.files.file;
            var fileName = file.name;



            file.mv('./upload/'+fileName, function(err) {
                if (err) {
                    res.status(500).send(err);
                }
                else {
                    res.status(200).send('{success: true}');
                }
            });
        }
    );
