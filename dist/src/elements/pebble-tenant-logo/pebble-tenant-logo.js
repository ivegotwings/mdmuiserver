/**
    `pebble-tenant-logo` Represents the logo of the tenant in the title-bar and footer.

    @demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class PebbleTenantLogo extends PolymerElement {
  static get template() {
    return html`
        <style>
            img {
                vertical-align: middle;
            }
        </style>

        <img id="logoLink" height="25" src\$="[[logoUrl]]" on-click="[[onLogoClick]]">
`;
  }

  static get is() {
      return "pebble-tenant-logo";
  }
  static get properties() {
      return {
          /**
           * Indicates the url of the logo image.
           */
          logoUrl: {
              type: String,
              value: ""
          },
          /**
           * Indicates the logo text displayed along with the logo image.
           */
          logoText: {
              type: String,
              value: ""
          },
          /**
           * Can be used to invoke the event handler function when the logo is clicked.
           */
          onLogoClick: {
              type: Function
          }
      }
  }
}
customElements.define(PebbleTenantLogo.is, PebbleTenantLogo);
