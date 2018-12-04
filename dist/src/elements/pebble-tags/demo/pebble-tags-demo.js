/**
`pebble-tags` Represents a group of tag items which together can form a selection.

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import { microTask } from '@polymer/polymer/lib/utils/async.js';
import '../../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../../bedrock-pubsub/bedrock-pubsub.js';
import '../../bedrock-style-manager/styles/bedrock-style-common.js';
import '../../pebble-popover/pebble-popover.js';
import '../pebble-tags.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer$0({
  _template: Polymer.html`
    <style include="bedrock-style-common">
    /* */
    </style>    
    
      <pebble-tags id="ex1" tags="{{tags}}" show-icon="" show-expand-icon="" show-remove-icon="">
      </pebble-tags>
      <pebble-popover id="tagpopover">
           [[_selectedItem]]                  
      </pebble-popover>
      <bedrock-pubsub event-name="on-tap-tag-remove" handler="_onTagItemRemove"></bedrock-pubsub>
      <bedrock-pubsub event-name="on-tap-tag-item" handler="_onTagItemTap"></bedrock-pubsub>
      <br><br>
      <template is="dom-repeat" items="[[tags]]" as="tag">
          <div>[[tag.longName]]</div>
      </template>
      <div id="selectedItem">Current selected item: [[_selectedItem]]</div>
      <div id="removedItem">Current removed item: [[_removedItem]]</div>
`,

  is: 'pebble-tags-demo',

  properties: {

    /**
     * Indicates the list of strings that holds the tags. Values in this array must be identical. Avoid duplicates due to the definition of tags. Icons for individual tag can also be passed in this list.
     */
    tags:{
      type:Array,
      notify: true,
      value:function(){
          return [
                      {
                          "name": "Brand",
                          "value": {"eq": "Levis"},
                          "displayParams": ["eq"],
                          "icon":"settings",
                          "options": {
                                      "displayType": "textBox"
                                     }
                      },
                      {
                          "name": "Color",
                          "value": {"eq": "Red"},
                          "displayParams": ["eq"],
                          "options": {
                                      "displayType": "textBox"
                                     }                        
                      },
                      {
                          "name": "Size",
                          "value": {"eq": "Medium"},
                          "displayParams": ["eq"],
                          "options": {
                                      "displayType": "textBox"
                                     }
                      },
                      {
                          "name": "Name",
                          "value": {"eq": "Extreme"},
                          "displayParams": ["eq"],
                          "options": {
                                      "displayType": "textBox"
                                     }
                      }
                  ];
      }
    },

    _selectedItem: {
        type: String,
        value: null
    },

    _removedItem: {
        type: String,
        value: null
    },

    _showPopoverFor: {
        type: String,
        value: null
    }

  },

  behaviors: [
      RUFBehaviors.UIBehavior
  ],

  /**
   * Handler for 'tag-item-remove' event, which is fired when a <tag-item> is being removed.
   *
   * @param {Object} event object.
   */
  _onTagItemRemove: function(e, detail) {
       this._removedItem = detail.longName;
  },

  _onTagItemTap:function (e, detail) {
      this._selectedItem = detail.longName;

      this.shadowRoot.querySelector('#tagpopover').hide();
       microTask.run(() => {    
           this.shadowRoot.querySelector('#tagpopover').positionTarget = this.querySelector("#tag" + detail.index);
           this.shadowRoot.querySelector('#tagpopover').open();
      });       
  }
});
