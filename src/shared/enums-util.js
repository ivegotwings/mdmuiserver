'use strict';

var Enums = function () { };

Enums.actions = {
    SaveComplete:1,
    SaveFail:2,
    GovernComplete:3,
    GovernFail:4,
    WorkflowTransitionComplete:5,
    WorkflowTransitionFail:6,
    WorkflowAssignmentComplete:7,
    WorkflowAssignmentFail:8
}

Enums.operations = {
    WorkflowTransition: 1
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

