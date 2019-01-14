/**
<b><i>Content development is under progress... </b></i>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-helpers/data-helper.js';
import '../bedrock-grid-datasource-behavior/bedrock-grid-datasource-behavior.js';
import '../liquid-event-get/liquid-event-get.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class TaskErrorGridDatasource extends mixinBehaviors([RUFBehaviors.GridDataSourceBehavior], PolymerElement) {
  static get template() {
    return Polymer.html`
        <liquid-event-get id="initiateSearchResult" operation="initiatesearch" request-data="[[request]]" last-response="{{_initSearchResponse}}" exclude-in-progress=""></liquid-event-get>
        <liquid-event-get id="getSearchResultDetail" operation="getsearchresultdetail" request-data="[[request]]" request-id="[[_initSearchResponse.content.requestId]]" last-response="{{searchResultResponse}}" exclude-in-progress=""></liquid-event-get>
`;
  }

  static get is() {
      return "task-error-grid-datasource";
  }
  static get properties() {
      return {
          _liquidInitSearchElement: {
              type: Object,
              value: function () {
                  return {}
              }
          },

          _liquidGetSearchElement: {
              type: Object,
              value: function () {
                  return {}
              }
          },

          _isRequestInitiated: {
              type: Boolean,
              value: false
          },

          _options: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          _totalCount: {
              type: Number,
              notify: true,
              value: 0
          }
      }
  }
  ready() {
      super.ready();
      this._liquidInitSearchElement = dom(this).node.shadowRoot.querySelector(
          "liquid-event-get[id='initiateSearchResult']");
      this._liquidGetSearchElement = dom(this).node.shadowRoot.querySelector(
          "liquid-event-get[id='getSearchResultDetail']");

      this.rDataSource = this._dataSource.bind(this);
  }
  /**
   * <b><i>Content development is under progress... </b></i> 
   */
  resetDataSource() {
      this._resetDataSource();
  }

  _dataSource(data, success, error) {
      // Bind Reponse Methods
      DataHelper.oneTimeEvent(this._liquidInitSearchElement, 'response', this._onInitSearchResponse.bind(
          this));

      DataHelper.oneTimeEvent(this._liquidGetSearchElement, 'response', this._onGetSearchResponse.bind(
          this, success, error));

      // Set Options
      this._options = data;
      if (data.filter && data.filter.length) {
          let attributesCriterion = this._createAttributesCriterion(data.filter);
          let taskCriteria = this.request.params.query.filters.attributesCriterion.find(function (
              attrCriteria) {
              return attrCriteria.taskId;
          });
          if (taskCriteria) {
              attributesCriterion.push(taskCriteria);
          }
          this.set("request.params.query.filters.attributesCriterion", attributesCriterion);
      }
      if (data.sortOrder && data.sortOrder.length) {
          let sortCriterion = this._createSortCriterion(data.filter);
          this.set("request.params.sort.attributes", sortCriterion);
      }
      // Set Range
      let requestOptions = this._prepareRequestOptions(this._options);
      this.set("request.params.options", requestOptions);

      // Initiate Request only for First Time.
      if (!this._isRequestInitiated) {
          this._liquidInitSearchElement.generateRequest();
      } else {
          this._liquidGetSearchElement.generateRequest();
      }
  }
  _createAttributesCriterion(filter) {
      let attrsCriterion = [];
      for (let i = 0; i < filter.length; i++) {
          let criteria = {};
          criteria[filter[i].path] = {
              "eq": filter[i].filter
          };
          attrsCriterion.push(criteria);
      }
      return attrsCriterion;
  }
  _createSortCriterion(sortOrder) {
      let sortCriterion = [];
      for (let i = 0; i < sortOrder.length; i++) {
          let criteria = {};
          criteria[sortOrder[i].path] = sortOrder[i].direction == "desc" ? "_DESC" : "_ASC";
          sortCriterion.push(criteria);
      }
      return sortCriterion;
  }
  _onInitSearchResponse(e) {
      this._totalCount = e.detail.response.content.totalRecords;
      this._resultRecordSize = e.detail.response.content.resultRecordSize;
      this._liquidGetSearchElement.generateRequest();
      this._isRequestInitiated = true;
  }

  _onGetSearchResponse(success, error) {
      if (this._lastPage < this._options.page) {
          if (this.searchResultResponse.status == "success") {
              // Format ResponseData
              let searchResults = this._formatResponse(this.searchResultResponse);
              if (typeof (searchResults) == 'undefined') {
                  searchResults = [];
              }

              // UpdateCurrent RecordSize
              this._updateCurrentRecordSize(this._options, searchResults, this._totalCount, this._resultRecordSize);

              // Invoke Callback
              success(searchResults);
          } else {
              error();
          }
      }
  }
}
customElements.define(TaskErrorGridDatasource.is, TaskErrorGridDatasource);
