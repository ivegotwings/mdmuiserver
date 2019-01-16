/**
`pebble-main-logo`  Represents the main logo element on the title bar. 

@demo demo/index.html 
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class PebbleMainLogo extends PolymerElement {
  static get template() {
    return html`
        <style>
            #logoName {
                font-size: 17px;
                text-decoration: none;
                font-weight: 700;
            }

            #logoLink {
                vertical-align: middle;
                padding-left: 10px;
            }

            img {
                @apply --pebble-main-logo-img;
            }
        </style>
        <img id="logoLink" src\$="[[logoUrl]]" on-tap="[[onLogoClick]]">
        <!-- <a id="logoName" href="/" on-tap="[[onLogoClick]]">[[logoText]]</a>-->
`;
  }

  static get is() {
      return "pebble-main-logo";
  }
  static get properties() {
      return {
          /**
           * Indicates the url of the logo image.
           * 
           */
          logoUrl: {
              type: String,
              value: "images/mdm-logo.svg"
          },
          /**
           * Indicates the logo text displayed along with the logo image.
           * 
           */
          logoText: {
              type: String,
              value: "MDMCenter"
          },
          /**
           * Can be used to invoke the event handler function when the logo is clicked.
           * 
           */
          onLogoClick: {
              type: Function
          }
      }
  }
}
customElements.define(PebbleMainLogo.is, PebbleMainLogo);
