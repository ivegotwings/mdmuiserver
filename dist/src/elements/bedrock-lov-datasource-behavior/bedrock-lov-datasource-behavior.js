import '@polymer/polymer/polymer-legacy.js';
import '../bedrock-datasource-behavior/bedrock-datasource-behavior.js';
/***
 * `RUFBehaviors.LOVDataSourceBehavior` provides common properties and methods that must be implemented for all
 *  grid dataSource components. It is a mandatory behavior for all grid datasource components to implement.
 *
 *  ### Example
 *
 *     <dom-module id="x-lov-datasource">
 *        <template>
 *        </template>
 *        <script>
 *           Polymer({
 *             is: ""x-lov-datasource",
 *
 *             behaviors: [
 *               RUFBehaviors.LOVDataSourceBehavior
 *             ],
 *
 *             properties: {
 *              
 *             }
 *           });
 *        &lt;/script>
 *     </dom-module>
 * @demo demo/index.html
 * @polymerBehavior RUFBehaviors.LOVDataSourceBehavior
 */
//required for gulp script parsing
//files with window.RUFBehaviors in them are not delayed for loading
window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.LOVDataSourceBehavior */
RUFBehaviors.LOVDataSourceBehaviorImpl = {

    properties: {
      /**
        * Content is not appearing - Content development is under progress. 
        */
        isResponseAttached: {
            type: Boolean,
            value: false
        },
      /**
        * Content is not appearing - Content development is under progress. 
        */
        isRequestInitiated: {
            type: Boolean,
            value: false
        }
    },
      /**
        * Content is not appearing - Content development is under progress. 
        */
    checkIfRequestChanged: function () {
        let utils = SharedUtils.DataObjectFalcorUtil;
        let requestFilterExists = false;
        let lastRequestFilterExists = false;
        
        if (this.request && this.request.params && this.request.params.query.filters) {
            requestFilterExists = true;
        }
        
        if (this._lastRequest && this._lastRequest.params && this._lastRequest.params.query.filters) {
            lastRequestFilterExists = true;
        }


        if (requestFilterExists != lastRequestFilterExists) {
            return true;
        } else if (!requestFilterExists && !lastRequestFilterExists) {
            return true;
        }


        if (requestFilterExists) {
            if(this.request.params.query.domain != this._lastRequest.params.query.domain){
                return true;
            }
            if (!utils.compareObjects(this.request.params.query.filters.keywordsCriterion, this._lastRequest.params.query.filters.keywordsCriterion)) {
                return true;
            }
            if (!utils.compareObjects(this.request.params.query.filters.typesCriterion, this._lastRequest.params.query.filters.typesCriterion)) {
                return true;
            }
            if (!utils.compareObjects(this.request.params.query.filters.attributesCriterion, this._lastRequest.params.query.filters.attributesCriterion)) {
                return true;
            }
            if (!utils.compareObjects(this.request.params.query.filters.relationshipsCriterion, this._lastRequest.params.query.filters.relationshipsCriterion)) {
                return true;
            }
            if (!utils.compareObjects(this.request.params.query.filters.propertiesCriterion, this._lastRequest.params.query.filters.propertiesCriterion)) {
                return true;
            }
            if (!utils.compareObjects(this.request.params.query.ids, this._lastRequest.params.query.ids)) {
                return true;
            }
        }
        if (!utils.compareObjects(this.request.params.sort, this._lastRequest.params.sort)) {
            return true;
        }
        if (!utils.compareObjects(this.request.params.additionalIds, this._lastRequest.params.additionalIds)) {
            return true;
        }
        return false;
    }
};
/** @polymerBehavior */
RUFBehaviors.LOVDataSourceBehavior = [RUFBehaviors.DataSourceBehavior, RUFBehaviors.LOVDataSourceBehaviorImpl];
