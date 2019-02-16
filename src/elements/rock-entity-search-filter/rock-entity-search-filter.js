/**
`rock-entity-search-filter` Represents a component that renders the entity search filter control.
It filters the entities in the grid and provides a mechanism to add the filter criteria for the entities in the grid.
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-app-context-behavior/bedrock-app-context-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../rock-search-filter/rock-search-filter.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntitySearchFilter extends mixinBehaviors([RUFBehaviors.UIBehavior, RUFBehaviors.AppContextBehavior], PolymerElement) {
  static get template() {
    return html`
        <rock-search-filter id="search-filter" domains="[[domains]]" settings="[[settings]]" attributes-type="[[attributesType]]" icon="pebble-icon:filter" text="Refine More" filters-config="[[filtersConfig]]" tags="{{tags}}" max-allowed-values-for-search="[[maxAllowedValuesForSearch]]" context-data="[[contextData]]" hide-search-trigger="">
        </rock-search-filter>
        <bedrock-pubsub event-name="tag-value-change" handler="_onSearchTagValueChange"></bedrock-pubsub>
        <bedrock-pubsub event-name="tag-item-remove" handler="_onTagItemRemove"></bedrock-pubsub>
        <bedrock-pubsub event-name="filter-tags-remove" handler="_onFilterTagsRemove"></bedrock-pubsub>
`;
  }

  static get is() {
      return "rock-entity-search-filter";
  }

  static get properties() {
      return {
          selectedSearchFilters: {
              type: Array,
              value: function () {
                  return [];
              },
              notify: true
          },

          contextData: {
              type: Object,
              value: function () {
                  return {};
              },
              notify: true,
              observer: '_prepareContext'
          },

          _contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },

          typesCriterion: {
              type: Array,
              observer: '_prepareContext'
          },

          domains: {
              type: Array,
              value: function () { return []; }
          },

          tags: {
              type: Array,
              value: function () { return []; }
          },

          attributesType: {
              type: String,
              value: "self"
          },

          settings: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          
          maxAllowedValuesForSearch:{
              type: Number                        
          }
      };
  }

  constructor() {
      super();
  }

  connectedCallback() {
      super.connectedCallback();
  }

  disconnectedCallback() {
      super.disconnectedCallback();
  }

  clearSearchFilters() {
      this.shadowRoot.querySelector('#search-filter').removeAllSearchFilters();
  }

  // Refine Filter
  _onTagItemRemove(e, detail) {
      if (detail != undefined) {
          if (!detail.options) {
              return;
          }
          this._removeFilterWithName(detail.name);
          if (detail.options.type == "context") {
              let context = {};
              let contextData = this.contextData[this.CONTEXT_TYPE_DATA];
              if (contextData.length) {
                  context = contextData[0];
              }
              delete context[detail.name];
              this.updateContext(this.CONTEXT_TYPE_DATA, [context]);
          } else {
              let _selectedSearchFilters = this.selectedSearchFilters;
              this.selectedSearchFilters = undefined;
              this.selectedSearchFilters = _selectedSearchFilters;
          }
      }
  }

  _onFilterTagsRemove(e, detail) {
      let tags = detail || [];
      if (tags.length == 0) {
          return;
      }

      for (let i = 0; i < tags.length; i++) {
          this._removeFilterWithName(detail[i].name);
      }
  }

  _onSearchTagValueChange(e, detail, sender) {
      if (detail != undefined) {
          if (detail.type == "context") {
              let context = {};
              let val = detail.value.eq;
              let contextData = this.contextData[this.CONTEXT_TYPE_DATA];
              if (contextData.length) {
                  context = contextData[0];
              }
              context[detail.name] = val;
              this.updateContext(this.CONTEXT_TYPE_DATA, [context]);
          } else {
              let attrCond = {};
              attrCond[detail.name] = detail.value;
              this._removeFilterWithName(detail.name);

              let _selectedSearchFilters = DataHelper.cloneObject(this.selectedSearchFilters);
              _selectedSearchFilters.push(attrCond);

              this.set('selectedSearchFilters', _selectedSearchFilters);
          }
      }
  }

  _removeFilterWithName(name) {
      if (this.selectedSearchFilters && this.selectedSearchFilters.length > 0) {
          for (let i = 0; i < this.selectedSearchFilters.length; i++) {
              if (this.selectedSearchFilters[i][name]) {
                  this.selectedSearchFilters.splice(i, 1);
              }
          }
      }
  }

  _prepareContext() {
      if (!_.isEmpty(this.contextData)) {
          let domain;
          if (this.domains) {
              domain = this.domains[0];
          }
          if (this.typesCriterion && this.typesCriterion.length > 0) {
              let itemContexts = [];
              for (let i in this.typesCriterion) {
                  let itemContext = {
                      'type': this.typesCriterion[i],
                      "domain": domain
                  };
                  itemContexts.push(itemContext);
              }
              this.contextData[ContextHelper.CONTEXT_TYPE_ITEM] = itemContexts
          }
      }
  }

  formatFilterCollectionDisplay(collection, seperator) {
      let searchFilter = this.shadowRoot.querySelector('#search-filter');

      if (searchFilter) {
          return searchFilter.formatFilterCollectionDisplay(collection, seperator);
      }
  }

  refresh() {
      let searchFilter = this.shadowRoot.querySelector('#search-filter');
      if (searchFilter && searchFilter.refresh) {
          searchFilter.refresh();
      }
  }
}

customElements.define(RockEntitySearchFilter.is, RockEntitySearchFilter);
