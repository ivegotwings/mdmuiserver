'use strict';
var config = require('config');
var isEmpty = require('../common/utils/isEmpty');

var fs = require('fs');

module.exports = function (app) {
    var dir = './download';

    var fileStoragePath = config.get('modules.fileDownload.fileStoragePath');
    if (!isEmpty(fileStoragePath)) {
        if (fs.existsSync(fileStoragePath)) {
            dir = fileStoragePath + '/download';
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
