/**
`rock-footer` Represents an element that renders the footer for an App.
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../pebble-main-logo/pebble-main-logo.js';
import '../pebble-tenant-logo/pebble-tenant-logo.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockFooter
    extends mixinBehaviors([], PolymerElement) {
  static get template() {
    return html`
        <style include="bedrock-style-common bedrock-style-padding-margin">
             :host {
                background: var(--rock-footer-background-color, #ffffff);
                height: 30px;
                position: fixed;
                left: 45px;
                right: 0;
                bottom: 0;
                padding:5px;
            }

            .footer {
                font-family: var(--default-font-family);
                font-size: var(--font-size-sm, 12px);
                line-height: 1.4;
                text-align: center;
            }

            .Powered-by {
                font-size: var(--font-size-sm, 12px);
                color: var(--rock-footer-font-color, #75808b);
            }

            #footerName {
                font-weight: var(--font-bold, bold);
                font-size: var(--default-font-size, 14px);
                color: var(--rock-footer-company, #364653);
            }

            .footer {
                 --pebble-main-logo-img:{
                     width: 80px !important;
                     height: 15px !important;
                 };
              }

            .seperator {
                color: var(--link-text-color, #036Bc3);
                margin: 0 10px;
                font-weight: var(--font-medium, 500);
            }
        </style>
        <div class="footer">
            <span id="footerName" class="m-b-5">[[_logoText]]</span>
            <span class="seperator">::</span>
            <a class="Powered-by">Version - [[version]]</a>
            <span class="seperator">::</span>
            <span class="Powered-by">Powered by 
                <pebble-main-logo logo-url="../src/images/main-logo.svg"></pebble-main-logo>
            </span>
        </div>
`;
  }

  static get is() {
      return 'rock-footer';
  }

  static get properties() {
      return {
          tenantLogoText: {
              type: String,
              value: ""
          },
          _logoText: {
              type: Function,
              computed: '_getLogoText(tenantLogoText)'
          },
          version: {
              type: Function,
              computed: '_getVersion()'
          }
      }
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */

  _getLogoUrl() {
      return RUFUtilities.mainApp.tenantLogo;
  }
  _getVersion() {
      return RuntimeVersionManager.getVersion();
  }
  _getLogoText(tenantLogoText) {
      if (tenantLogoText != "") {
          return tenantLogoText;
      }
      return RUFUtilities.mainApp.tenantLogoText;
  }
}
customElements.define(RockFooter.is, RockFooter)
