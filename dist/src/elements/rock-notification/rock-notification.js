/**
`<rock-notification>` Represents an icon with the notification badge.

### Example

    <rock-notification id="rocknotify" label="54"></rock-notification>
    <script>
		window.addEventListener('WebComponentsReady', function(e) {
		    document.querySelector("#rocknotify").addEventListener('click', function(e) {
			    alert("Rock notification raised!!");
			});
		});
	</script>

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|--------
`--notification-badge` | Mixin applied to the badge | `{}`
`--notification-icon` | Mixin applied for the icon | `{}`
`--badge-hover-pointertype` | badge hover pointer type | `pointer`


@group Rock Elements
@element rock-notification
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../pebble-badge/pebble-badge.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icons/pebble-icons.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockNotification
    extends mixinBehaviors([], PolymerElement) {
  static get template() {
    return Polymer.html`
            <style include="bedrock-style-common bedrock-style-icons">
                :host {
                    display: inline-block;
                    position: relative;
                    outline: 0;
                }

                pebble-badge {
                    @apply --layout;
                    @apply --layout-center-center;
                    @apply --notification-font-common-base;
                    font-weight: normal;
                    font-size: var(--font-size-xs, 10px);                         
                    border-radius: 50%;      
                    position:absolute;
                    top: -6px !important;
                    right: -6px;
                    left: auto!important;
                    --pebble-badge: @apply --notification-badge;
                }

                .badgeContainer:hover {
                    cursor: var(--badge-hover-pointertype, pointer);
                }
            </style>
  
        <span class="badgeContainer">
            <pebble-icon id\$="{{id}}" icon="{{icon}}" alt="{{alt}}" class="pebble-icon-color-white pebble-icon-size-20"></pebble-icon>
            <template is="dom-if" if="{{_show(label)}}">
                <pebble-badge for="{{id}}" label="{{label}}"></pebble-badge>
            </template>
        </span>
`;
  }

  static get is() {
      return 'rock-notification';
  }

  static get properties() {
          return {
              id: {
                  type: String,
                  value: null
              },

              /**
             * Indicates an identification for the `pebble-icons`.
             * When you use this, the button content is shown as an icon.
             */
              icon: {
                  type: String,
                  value: "pebble-icon:notification"
              },

              /**
             * Indicates an alternative text for the button for the accessibility.
             */
              alt: {
                  type: String,
                  value: "Notification"
              },

              /**
             * Indicates a label on the badge. The label is centered and
             * must have very few characters.
             */
              label: {
                  type: Number,
                  value: null
              }
          }
      }


  /**
 * Indicates the identification of an element.
 */


  _show(label) {
      if(label > 0) {
          return true;
      }

      return false;
  }
}
customElements.define(RockNotification.is, RockNotification)
