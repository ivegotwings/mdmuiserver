import '@polymer/polymer/polymer-legacy.js';
import '../bedrock-datasource-behavior/bedrock-datasource-behavior.js';
/***
 * `RUFBehaviors.GridDataSourceBehavior` provides common properties and methods that must be implemented across all
 *  the grid datasource components. It is a mandatory behavior for all these components to implement.
 *
 *  ### Example
 *
 *     <dom-module id="x-grid-datasource">
 *        <template>
 *        </template>
 *        <script>
 *           Polymer({
 *             is: ""x-grid-datasource",
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
 * @polymerBehavior RUFBehaviors.GridDataSourceBehavior
 */
//required for gulp script parsing
//files with window.RUFBehaviors in them are not delayed for loading
window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.GridDataSourceBehavior */
RUFBehaviors.GridDataSourceBehaviorImpl = {

    properties: {
        /**
         * Content is not appearing - Indicates an incremental data size for each page in the grid using "datasource" for virtualization.
         * This is auto calculated.
         **/
        bufferRecordSize: {
            type: Number,
            notify: true,
            value: 0
        },

        /**
         * Content is not appearing - Indicates the total record size of the grid.
         * This is auto calculated.
         */
        currentRecordSize: {
            type: Number,
            notify: true,
            value: 0
        },
        /**
         * Content is not appearing - Indicates the total record size available.
         *
         */
        totalCount: {
            type: Number,
            notify: true,
            value: 0
        },
        /* resultRecordSize contains no of maximimum limited record(200 now)*/
        resultRecordSize: {
            type: Number,
            notify: true,
            value: 0
        },

        _lastPage: {
            type: Number,
            value: -1
        },
        _currentViewMode:{
            type:String,
            value:""
        },
        _isRequestInitiated:{
            type:Boolean,
            value:false
        }
    },

    _prepareRequestOptions: function (data) {
        if(this._currentViewMode && this._currentViewMode !=data.viewMode){
            this._resetDataSource();
        }
        this._currentViewMode=data.viewMode;
        if(data.viewMode=="Tile" || data.viewMode=="List" || data.viewMode == "lov") {
            return {
                from : data.page > 0 ? (data.page - 1) * data.pageSize : 0,
                to : data.page > 0 ? data.page * data.pageSize - 1 : 0
            }
        }
        return {
            "from": data.page * data.pageSize,
            "to": ((data.page * data.pageSize) + data.pageSize) - 1
        };
    },

    _formatResponse: function (data,event) {
        if (typeof (this.rDataFormatter) == 'function') {
            return this.rDataFormatter(data,event);
        } else {
            return data;
        }
    },

    _updateCurrentRecordSize: function (options, records,totalCount,resultRecordSize) {
        // Do not calculate the bufferRecordSize when previous and current options are same
        if (this._previousOptions && options &&
            this._previousOptions.page == options.page &&
            this._previousOptions.pageSize == options.pageSize) {
            return;
        }
        this._previousOptions = DataHelper.cloneObject(options);

        let recordsLength=records.length;
        let bufferRecordSize = this.bufferRecordSize;

        if(records.deletedCount){
            recordsLength=recordsLength+records.deletedCount;
        }

        if (options.pageSize <= recordsLength) {
            if (bufferRecordSize / options.pageSize >= options.page) {
                bufferRecordSize += bufferRecordSize == 0 ? options.pageSize *
                    2 : options.pageSize;
            }
        } else {
            if (bufferRecordSize == 0) {
                bufferRecordSize = recordsLength;
            } else {
                bufferRecordSize -= (options.pageSize - recordsLength);
            }
        }

        this.bufferRecordSize = bufferRecordSize < 0 ? recordsLength : bufferRecordSize;
        this._lastPage = options.page;
        this.currentRecordSize += records.length;

        if(totalCount !== undefined){
            this.totalCount=totalCount;
        }

        if(resultRecordSize !== undefined){
            this.resultRecordSize = resultRecordSize;
        }
    },

    _resetDataSource: function () {
        this._isRequestInitiated=false;
        this.bufferRecordSize = 0;
        this.currentRecordSize = 0;
        this._previousOptions = {};
        this._lastPage = -1;
    },
};
/** @polymerBehavior RUFBehaviors.GridDataSourceBehavior */
RUFBehaviors.GridDataSourceBehavior = [RUFBehaviors.DataSourceBehavior, RUFBehaviors.GridDataSourceBehaviorImpl];
