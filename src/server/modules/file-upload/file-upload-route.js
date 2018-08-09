'use strict';
let config = require('config');
let isEmpty = require('../common/utils/isEmpty');

let fileUpload = require('express-fileupload'),
    fs = require('fs'),
    uuidV1 = require('uuid/v1');

module.exports = function(app) {
    app.use(fileUpload());
    let dir = './upload';

    let fileStoragePath = config.get('modules.fileDownload.fileStoragePath');

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
            let file = req.files.file;
            let fileName = file.name;
            let newFileName = fileName + '__' + uuidV1();

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
