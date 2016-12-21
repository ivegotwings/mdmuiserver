'use strict';

require("babel-register");
require("babel-polyfill");

var express = require('express');
var history = require('connect-history-api-fallback');
var cors = require('cors');
var bodyParser = require('body-parser');

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cors());

//Load falcor routes
var entityRoute = require('./src/server/routes/entity-data/router');

var buildPath = __dirname;
//console.log(buildPath);

//var oneDay = 86400000;

app.use(express.static(buildPath,{maxAge : "1s"}));

entityRoute(app);

app.get('*', function(req, res){
    res.sendFile(buildPath + '/index.html');
});

app.listen(5005, function () {
    console.log("Web server started at port http://localhost:5005/");
});

