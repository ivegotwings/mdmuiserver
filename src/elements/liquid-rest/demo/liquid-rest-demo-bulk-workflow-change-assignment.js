import { Base } from '@polymer/polymer/polymer-legacy.js';
import '../liquid-rest.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="liquid-rest-demo-bulk-workflowChangeAssignment">
    <template>
        <liquid-rest id="liquidRest" url="/pass-through-bulk/entitygovernservice/workflowChangeAssignment" auto\$="[[auto]]" verbose="" method="POST" request-data="{{request}}" last-response="{{response}}" on-response="_onAssignmentComplete" on-error="_onAssignmentFailed"></liquid-rest>
    </template>
    
</dom-module>`;

document.head.appendChild($_documentContainer.content);
Polymer({
    is: 'liquid-rest-demo-bulk-workflow-change-assignment',
    attached: function () {
    },
    properties: {
        auto: {
            type: Boolean,
            value: false
        },
        request: {
            type: Object,
            value: function () {
                return {
                    "params": {
                        "workflow": {
                            "workflowName": "newProductSetup", "activity": {
                                "activityName": "Review Assortment", "newlyAssignedUserName":
                                    "shridhar.moorkhandi@riversand.com"
                            }
                        }
                    }, "clientState": {
                        "notificationInfo": {
                            "operation": 2, "showNotificationToUser":
                                true, "context": {
                                    "appInstanceId": "app-entity-manage-component-c2edef74c51c7e19", "workflowName": "newProductSetup", "workflowActivityName":
                                        "Review Assortment", "workflowAction": "assigned to 'shridhar.moorkhandi@riversand.com'"
                                }
                        }
                    }, "entities": [
                    // {
                    //     "id": "Nike25April4Shirt122",
                    //     "type": "sku"
                    // },
                    // { 
                    //     "id": "Nike25April4Shirt1235", 
                    //     "type": "sku" 
                    // }
                ]
                };
            },
            notify: true
        },
        entities: {
            type: Object,
            value: function () {
                return {};
            },
            notify: true
        }
    },
    generateRequest: function () {
        this.shadowRoot.querySelector('#liquidRest').generateRequest();
    },
    _onAssignmentComplete: function (e) {
        console.log('Change assignment response ', JSON.stringify(e.detail.response, null, 4));
    },
    _onAssignementFailed: function (e) {
        Base._error('Change assignment failed with error ', e.detail);
    }
});
