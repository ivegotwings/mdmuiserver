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

// // parse application/json
// app.use(bodyParser.json());
// // parse text
// app.use(bodyParser.text({ type: 'any' }));

app.use(cors());

//Load falcor routes    
var entityRoute = require('./routes/entityroutes.js');

entityRoute(app);

app.locals.basedir = '/src/server';

app.use(express.static('__dirname' + '/'));

app.listen(5005, function () {
    console.log("Server started at port 5005");
});

