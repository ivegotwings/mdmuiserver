import '@polymer/polymer/polymer-legacy.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="bedrock-app-layout-height">
    <template>
      <style>
            app-dashboard {
                --app-dashboard-content-height: {
                    height: calc(var(--window-inner-height) - 104px)
                }
            }

            app-task-detail {
                --app-task-content-height: {
                    height: calc(var(--window-inner-height) - 104px)
                }
            }

            app-entity-manage {
                --app-entity-manage-content-height: {
                    height: calc(var(--window-inner-height) - 207px)
                }

                --app-entity-manage-tab-content-height: {
                    height: calc(var(--window-inner-height) - 250px)
                }
            }

            app-entity-discovery {
                --app-entity-discovery-content-height: {
                    height: calc(var(--window-inner-height) - 200px)
                }
            }

            app-reference-discovery {
                --app-reference-discovery-content-height: {
                    height: calc(var(--window-inner-height) - 200px)
                }
            }

            app-business-function {
                --app-business-function-content-height: {
                    height: calc(var(--window-inner-height) - 104px)
                }
            }

            app-entity-preview {
                --app-entity-preview-content-height: {
                    height: calc(var(--window-inner-height) - 40px)
                }
            }

            app-external-dashboard {
                --app-external-dashboard-content-height: {
                    height: calc(var(--window-inner-height) - 104px);
                }
            }
          
        </style>
     </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
