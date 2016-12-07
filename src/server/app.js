'use strict';

var express = require('express');
var history = require('connect-history-api-fallback');
var cors = require('cors');

var app = express();
app.use(cors());

//Load falcor routes    
var entityRoute = require('./routes/entityroutes.js');

entityRoute(app);

app.use(history());

app.locals.basedir = '/src/server';

app.use(express.static('__dirname' + '/'));

app.listen(5005, function () {
    console.log("Server started at port 5005");
});

