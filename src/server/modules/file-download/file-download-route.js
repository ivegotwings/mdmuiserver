'use strict';


var fs = require('fs');

module.exports = function(app) {
    var dir = './download';
    if (!fs.existsSync(dir)) {
        console.error('Download directory is not present.');
        return;
    }

    app.get('/file-download', function (req, res) {
            if (!req.query || !req.query["fileName"]) {
                res.send('File name is not there for download.');
                return;
            }

            var fileName = req.query["fileName"];
            console.log(fileName);            
            res.download(dir + '/'+ fileName);
        }
    );
};
