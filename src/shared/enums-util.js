'use strict';

var Enums = function () { };

Enums.actions = {
    SystemSaveComplete:1,
    SaveComplete:2,
    SystemSaveFail:3,
    SaveFail:4,
    GovernComplete:5,
    GovernFail:6,
    WorkflowTransitionComplete:7,
    WorkflowTransitionFail:8,
    WorkflowAssignmentComplete:9,
    WorkflowAssignmentFail:10,
    RSConnectComplete:11,
    RSConnectFail:12,
    BusinessConditionSaveComplete:13,
    BusinessConditionSaveFail:14,
    ModelImportComplete:15,
    ModelImportFail:16
}

Enums.operations = {
    WorkflowTransition: 1,
    WorkflowAssignment: 2,
    BusinessCondition:3
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

