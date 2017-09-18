'use strict';
var config = require('config');
var isEmpty = require('../common/utils/isEmpty');

var fileUpload = require('express-fileupload'),
    fs = require('fs'),
    uuidV1 = require('uuid/v1');

module.exports = function(app) {
    app.use(fileUpload());
    var dir = './upload';

    var fileStoragePath = config.get('modules.fileDownload.fileStoragePath');

    if (isEmpty(fileStoragePath)) {
        if (fs.existsSync(fileStoragePath)) {
            dir = fileStoragePath + '/upload';
        }
    }

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    app.post('/data/file-upload', function (req, res) {
            if (!req.files) {
                res.send('No files were uploaded.');
                return;
            }
            var file = req.files.file;
            var fileName = file.name;
            var newFileName = fileName + '__' + uuidV1();

            file.mv(dir + '/' + newFileName, function (err) {
                if (err) {
                    res.status(500).send(err);
                }
                else {
                    res.status(200).send({"success": true, "fileName": newFileName});
                }
            });
        }
    );

};
