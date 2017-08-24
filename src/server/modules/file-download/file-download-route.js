'use strict';
var config = require('../../config/rdf-connection-config.json');
var isEmpty = require('../common/utils/isEmpty');


var fs = require('fs');

module.exports = function (app) {
    var dir = './download';

    if (config && !isEmpty(config.fileStoragePath)) {
        if (fs.existsSync(config.fileStoragePath)) {
            dir = config.fileStoragePath + '/download';
        }
    }

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    app.get('/data/file-download', function (req, res) {
        if (!req.query || !req.query["fileName"]) {
            res.send('File name is not there for download.');
            return;
        }

        var fileName = req.query["fileName"];
        res.download(dir + '/' + fileName);
    }
    );
};
