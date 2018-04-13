'use strict';

const logger = require('../common/logger/logger-service');

module.exports = function(app) {
       app.post('/data/sendlogs', function (req, res) {
            var options = JSON.parse(req.body[0].message);
            logger[options.level](req.body[0].message);
        }
    );
};
