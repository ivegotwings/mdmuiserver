'use strict';

var Enums = function () { };

Enums.actions = {
    saveComplete:1,
    saveFail:2,
    governComplete:3,
    governFail:4,
    workflowTransitionComplete:5,
    workflowTransitionFail:6,
    workflowAssignmentComplete:7,
    workflowAssignmentFail:8
}

var SharedEnumsUtil = SharedEnumsUtil || {};

//register as module or as js 
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Enums;
    }
    exports.Enums = Enums;
}
else {
    if (!SharedEnumsUtil) {
        SharedEnumsUtil = {};
    }
    SharedEnumsUtil.Enums = Enums;
}

