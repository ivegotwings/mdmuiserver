'use strict';

var fileUpload = require('express-fileupload'),
    fs = require('fs'),
    uuidV1 = require('uuid/v1');

module.exports = function(app) {
    app.use(fileUpload());
    var dir = './upload';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    app.post('/file-upload', function (req, res) {
            if (!req.files) {
                res.send('No files were uploaded.');
                return;
            }
            var file = req.files.file;
            var fileName = file.name;
            var newFileName = fileName + '__' + uuidV1();

            file.mv('./upload/' + newFileName, function (err) {
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
