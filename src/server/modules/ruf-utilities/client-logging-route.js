'use strict';

const logger = require('../common/logger/logger-service');

module.exports = function(app) {
       app.post('/data/sendlogs', function (req, res) {
            logger.info(req.body[0].message);
        }
    );
};
