import '@polymer/polymer/polymer-legacy.js';
/***
 * `RUFBehaviors.DataSourceBehavior` provides common properties and methods that 
 *  must be implemented for all the
 *  datasource components. It is a mandatory behavior for all datasource components to implement.
 *
 * The multiple properties defined in the `RUFBehaviors.DataSourceBehavior` provide request object, data-source, and formatter methods.
 *
 *  ### Example
 *
 *     <dom-module id="x-datasource">
 *        <template>
 *        </template>
 *        <script>
 *           Polymer({
 *             is: ""x-datasource",
 *
 *             behaviors: [
 *               RUFBehaviors.DataSourceBehavior
 *             ],
 *
 *             properties: {
 *              
 *             }
 *           });
 *        &lt;/script>
 *     </dom-module>
 * @demo demo/index.html
 * @polymerBehavior RUFBehaviors.DataSourceBehavior
 */
//required for gulp script parsing
//files with window.RUFBehaviors in them are not delayed for loading
window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.DataSourceBehavior */
RUFBehaviors.DataSourceBehaviorImpl = {

    properties: {
        /**
         * Content is not appearing - Indicates an external data source which is binded to the `rock-grid` for loading the data.
         * The format for external data source and how to pass it is given in the above description.
         **/
        rDataSource: {
            type: Object,
            value: function () {
                return {}
            },
            notify: true
        },
        /**
         * Content is not appearing - Specifies the request object to initiate the search.
         */
        request: {
            type: Object,
            value: function () {
                return {};
            }
        },
        /**
         * Content is not appearing - Indicates a callback function where if user has given any "liquid" operation and request object to load the data,
         * user has to transform the data based on their grid config and return array of records.
         */
        rDataFormatter: {
            type: Object,
            value: function () {
                return {};
            },
            notify: true
        },
        /*
         * Content is not appearing - Indicates a callback function to pass the attributes criteria at the time of making a "liquid" call.
         */
        attributesCriterionBuilder: {
            type: Object,
            value: function () {
                return {};
            }
        },

        /*
         * Content is not appearing - Indicates a callback function that passes the keywords criteria at the time of making the "liquid" call.
         */
        keywordsCriterionBuilder: {
            type: Object,
            value: function () {
                return {};
            }
        },
        sortCriterionBuilder: {
            type: Object,
            value: function () {
                return {};
            }
        },
        filterCriterionBuilder: {
            type: Object,
            value: function () {
                return {};
            }
        },
    }
};
/** @polymerBehavior */
RUFBehaviors.DataSourceBehavior = [RUFBehaviors.DataSourceBehaviorImpl];
