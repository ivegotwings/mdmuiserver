'use strict';


var fs = require('fs');

module.exports = function(app) {
    var dir = './download';
    
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    app.get('/file-download', function (req, res) {
            if (!req.query || !req.query["fileName"]) {
                res.send('File name is not there for download.');
                return;
            }

            var fileName = req.query["fileName"];
            res.download(dir + '/'+ fileName);
        }
    );
};
