'use strict';

module.exports = function(app) {
       app.post('/data/sendlogs', function (req, res) {
            //Method will be invoked in batch of 10 messages or when client browser unloads
            //console.log(JSON.stringify(req.body));
        }
    );
};
