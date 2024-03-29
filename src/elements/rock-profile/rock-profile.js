/**
`<rock-profile>` Represents an element to display a profile with an image.

### Example

    <rock-profile src="person.jpg"
							    alt="Profile"
							    name="John Smith"
							    usertype="User"
							    icon="pebble-icons:expand-more">
	  </rock-profile>

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|---------
`--profile-image-width` | The width of the image | 30px
`--profile-image-height` | The height of the image | 30px
`--profile-container-max-width` | The max width of the profile container | 260px
`--profile-container-max-height` | The max height of the profile container | 60px
`--profile-container-padding` | The padding of the profile container | 2px
`--profile-font-size` | The font size of the container | 12px
`--container-hover-pointertype` | The pointer type shown on container hover | pointer
`--profile-image-box-max-width` | The max width of the image box | 60px
`--profile-image-align` | The profile image verticle align | center
`--image-box-styles` | Mixin applied to image box | {}
`--profile-name-content-align` | The content horizontal alignment for name | right
`--name-box-styles` | Mixin applied to the name box | {}
`--profile-usertype-content-align` | The content horizontal alignment for usertype | right
`--profile-usertype-fontsize` | The font size of usertype | 10px
`--usertype-box-styles` | Mixin applied to the usertype box | {}
`--profile-icon-align` | The icon verticle alignment | center
`--icon-box-styles` | Mixin applied to the icon box | {}
`--profile-flex-verticle-max-width` | The max width of the flex verticle  | 200px

@group rock Elements
@element rock-profile
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-helpers/security-context-helper.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-list.js';
import '../bedrock-style-manager/styles/bedrock-style-flex-layout.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-heading.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import '../pebble-popover/pebble-popover.js';
import '../pebble-icon/pebble-icon.js';
import { flush } from '@polymer/polymer/lib/legacy/polymer.dom.js';
class RockProfile extends PolymerElement {
  static get template() {
    return html`
    <style include="bedrock-style-common bedrock-style-heading bedrock-style-floating bedrock-style-icons bedrock-style-padding-margin bedrock-style-flex-layout bedrock-style-list">
      :host {
        --profile-image-size: 25px;
      }

      .profile-style {
        margin-left: 7px;
        margin-top: 5px;
        float: right;
      }

      /*Image style*/
      .thumbImage {
        width: var(--profile-image-size);
        height: var(--profile-image-size);
      }

      pebble-image-viewer {
        --layout-fit: {
          width: var(--profile-image-size);
          height: var(--profile-image-size);
          overflow: hidden;
          border-radius: 50%;
        }
        ;
      }

      /*Profile container style*/

      .container {
        max-width: var(--profile-container-max-width, 260px);
        max-height: var(--profile-container-max-height, 60px);
        font-size: var(--profile-font-size, 12px);
        @apply --layout-horizontal;
        @apply --layout-center-justified;
        @apply --container-styles;
      }

      .container:hover {
        cursor: var(--container-hover-pointertype, pointer);
      }

      /*For Image*/

      .img-box {
        max-width: var(--profile-image-box-max-width, 60px);
        margin-right: 10px;
        align-items: var(--profile-image-align, center);
        /*Verticle align*/
        -webkit-align-items: var(--profile-image-align, center);
        /*Verticle align*/
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        @apply --image-box-styles;
      }

      /*For Name*/

      .name-box {
        text-align: var(--profile-name-content-align, right);
        @apply --name-box-styles;
        line-height: 14px;
      }

      /*For Usertype*/

      .usertype-box {
        text-align: var(--profile-usertype-content-align, right);
        font-size: var(--profile-usertype-fontsize, 10px);
        @apply --usertype-box-styles;
      }

      /*For Icon*/

      .icon-box {
        @apply --icon-box-styles;
        /*margin-right: 5px;*/
        align-items: var(--profile-icon-align, center);
        /*Verticle align*/
        -webkit-align-items: var(--profile-icon-align, center);
        /*Verticle align*/
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        margin-left: 5px;
      }

      /*Profile horizontal div styles*/

      .flex-horizontal {
        @apply --layout-horizontal;
      }

      /*Profile verticle div styles*/

      .flex-vertical {
        max-width: var(--profile-flex-verticle-max-width, 260px);
        margin-top: 2px;
      }

      #popoverProfile {
        --pebble-popover-max-height: 460px;
        border: none;
        margin-top: 5px;
        min-width: 320px;
      }

      #popoverProfile {
        --popover: {
          padding-top: 0px !important;
          padding-right: 0px !important;
          padding-bottom: 0px !important;
          padding-left: 0px !important;

        }
      }

      #profile-details-wrap {
        min-width: 300px;
        font-size: var(--default-font-size, 14px);
      }

      .profile-img {
        width: 88px;
        height: 82px;
        float: left;
        overflow: hidden;
      }

      .profile-img img {
        width: 100%;
      }

      .profile-details {
        width: calc(100% - 88px);
        height: 82px;
        display: inline-block;
        color: var(--palette-white, #ffffff);
        background: var(--profile-details-bg, #139ee7);
        padding: 10px;
      }

      #profile-details-wrap ul {
        margin: 0;
        padding: 0;
      }

      .profile-content-wrap {
        padding: 10px;
      }

      .profile-details h5 {
        font-size: var(--default-font-size, 14px);
        margin: 0 0 2px;
        padding: 0;
        font-weight: 500;
      }

      .profile-details .sub-text {
        font-size: var(--font-size-xs, 10px);
        margin: 0;
      }

      .profile-content-table td {
        padding: 0;
      }

      .profile-content-table td:first-child {
        color: var(--secondary-button-text-color, #75808b);
      }

      .profile-content-table td:last-child {
        color: var(--text-primary-color, #1a2028);
      }

      .profile-content {
        padding: 5px 0;
        border-bottom: 1px solid var(--divider-color, #c1cad4);
      }

      .profile-content-table {
        width: 100%;
      }

      .profile-options ul li {
        padding: 5px 0;
      }

      .profile-options ul li a {
        color: var(--link-text-color, #036Bc3);
        display: inline-block;
        vertical-align: middle;
      }

      .profile-options ul li a:hover {
        color: var(--link-text-hover-color, #045aa2);
      }

      .profile-options ul li:last-child {
        padding-bottom: 0;
        cursor: pointer;
      }

      ul li {
        list-style-type: none;
      }

      .profile-preferences{
        color: var(--main-content-text-color, #192027);
        font-weight: bold;
      }     
       
      .profile-options {
        color: var(--focused-line, #026bc3);
      }

      .container.flex-horizontal:hover {
        background-color: var(--bgColor-hover, #e8f4f9);
        color: var(--focused-line, #026bc3);
      }
    </style>
    <div class="profile-style">
      <div id="userProfile" class="container" on-tap="_showProfile">
        <!-- Image section -->
        <div class="img-box box">
          <img alt="[[alt]]" src="[[src]]" class="thumbImage">
        </div>

        <!-- Name & user type section -->
        <div class="flex-vertical text-ellipsis m-0">
          <div class="name-box text-ellipsis box">
            [[contextData.UserContexts.0.userFullName]]
          </div>
          <div class="usertype-box box">
            [[contextData.UserContexts.0.roles]]
          </div>
        </div>

        <!-- Icon section -->
        <div class="icon-box box">
          <pebble-icon icon="{{icon}}" class="pebble-icon-color-white pebble-icon-size-10"></pebble-icon>
        </div>
      </div>
      <template is="dom-if" if="[[_popoverProfile]]">
        <pebble-popover id="popoverProfile" for="userProfile" no-overlap="" horizontal-align="right">
          <div id="profile-details-wrap">
            <div class="prifile-titile">
              <div class="profile-img"><img src\$="[[src]]">
              </div>
              <div class="profile-details">
                <h5>[[contextData.UserContexts.0.userName]]</h5>
                <p class="sub-text p-b-10">logged in as [[contextData.UserContexts.0.roles]]</p>
                <p class="sub-text">Organization</p>
                <p class="sub-text">[[contextData.UserContexts.0.tenantId]] Corporation</p>
              </div>
              <div class="clearfix">
              </div>
              <div class="profile-content-wrap">
                <div class="profile-preferences m-b-5">
                  <pebble-icon icon="pebble-icon:preferences" class="pebble-icon-size-16 m-r-5"></pebble-icon>
                  </div>
                <div class="profile-content m-b-5">
                  <table class="profile-content-table" cellpadding="0" cellspacing="0">
                    <tbody><tr>
                      <td>Role:</td>
                      <td>[[contextData.UserContexts.0.roles]]</td>
                    </tr>
                  </tbody></table>
                </div>
                <div class="profile-options">
                  <ul>
                    <!--<li>
                    <pebble-icon icon="pebble-icon:settings" class="pebble-icon-size-16 pebble-icon-color-blue m-r-5"></pebble-icon>
                    <a href="#" class="btn-link">My Settings-->
                    <!--</a>
                  </li>
                  <li>
                    <<pebble-icon icon="pebble-icon:password" class="pebble-icon-size-16 pebble-icon-color-blue m-r-5"></pebble-icon>
                    <<a href="#" class="btn-link">Change Password-->
                    <!--</a>
                  </li>-->
                    <li on-tap="_logout">
                      <pebble-icon icon="pebble-icon:logout" class="pebble-icon-size-16 pebble-icon-color-blue m-r-5"></pebble-icon>
                      <!--<a href="#" class="btn-link">-->Logout
                      <!--</a>-->
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </pebble-popover>
      </template>
    </div>
`;
  }

  static get is() { return 'rock-profile' }

  static get properties() {
    return {

      /**
       * Indicates the URL of an image.
       */
      src: {
        type: String,
        value: null
      },

      /**
       * Indicates a alternative short text for an image.
       */
      alt: {
        type: String,
        value: null
      },

      /**
       * Indicates an icon.
       */
      icon: {
        type: String,
        value: null
      },
      /**
        * <b><i>Content development is under progress... </b></i> 
        */
      contextData: {
        type: Object
      },
      /**
        * <b><i>Content development is under progress... </b></i> 
        */
        _popoverProfile: {
        type: Boolean,
        value: false
      }
    }
  }
  _showProfile() {
    this._popoverProfile = true;
    flush();
    this.shadowRoot.querySelector('#popoverProfile').show();
  }
  _logout() {
    SecurityContextHelper.logout();
  }
}
customElements.define(RockProfile.is, RockProfile)
