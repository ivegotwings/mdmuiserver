'use strict';

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
var entityRoute = require('./src/server/routes/entityroutes.js');

var buildPath = __dirname;
//console.log(buildPath);

var oneDay = 86400000;

app.use(express.static(buildPath,{maxAge : oneDay}));

entityRoute(app);

app.listen(5005, function () {
    console.log("Server started at port 5005");
});

