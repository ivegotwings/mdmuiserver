//import '@polymer/polymer/polymer-legacy.js';
import '../bedrock-app-context-behavior/bedrock-app-context-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
/***
* `RUFBehaviors.MatchMergeBehavior` provides common properties for match merge components
*
*  ### Example
*
*     <dom-module id="x-app">
*        <template>
*        </template>
*        <script>
*           Polymer({
*             is: "x-app",
*
*             behaviors: [
*               RUFBehaviors.MatchMergeBehavior
*             ],
*
*             properties: {
*              
*             }
*           });
*        &lt;/script>
*     </dom-module>
*/

window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.MatchMergeBehavior */
RUFBehaviors.MatchMergeBehaviorImpl = {
    properties: {
    },

    observers: [
    ],

    sortMatchedEntities(matchedEntityDetails, matchedEntities) {
        let entityDetails = DataHelper.cloneObject(matchedEntityDetails); //Actual entities data
        let entities = DataHelper.cloneObject(matchedEntities); //Which contains id and score only
        let sortedEntities = entityDetails; //set default
        if (!_.isEmpty(entities) && entities.every(entity => entity.score)) {
            let sortedMatchedEntities = _.sortBy(entities, 'score').reverse(); //desc
            sortedEntities = sortedMatchedEntities.map(matchedEntity => {
                return entityDetails.find(entity => entity.id == matchedEntity.id);
            });
        }
        return sortedEntities;
    }
};

/** @polymerBehavior */
RUFBehaviors.MatchMergeBehavior = [RUFBehaviors.UIBehavior, RUFBehaviors.ComponentContextBehavior, RUFBehaviors.MatchMergeBehaviorImpl];
