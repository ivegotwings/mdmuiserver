/**

<b><i>Content development is under progress... </b></i> 

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { PaperCheckedElementBehavior } from '@polymer/paper-behaviors/paper-checked-element-behavior.js';
import { PaperRippleBehavior } from '@polymer/paper-behaviors/paper-ripple-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleToggleButton extends mixinBehaviors([PaperCheckedElementBehavior], PolymerElement){
  static get template() {
    return html`
        <style>
            :host {
                display: inline-block;
                @apply --layout-center;
                @apply --paper-font-common-base;
            }

            :host([disabled]) {
                pointer-events: none;
            }

            :host(:focus) {
                outline:none;
            }

            .toggle-bar {
                position: absolute;
                height: 100%;
                width: 100%;
                border-radius: 8px;
                pointer-events: none;
                opacity: var(--pebble-toggle-button-unchecked-bar-opacity,0.4);
                transition: background-color linear .08s;
                background-color: var(--pebble-toggle-button-unchecked-bar-color, #000000);

                @apply --pebble-toggle-button-unchecked-bar;
            }

            .toggle-button {
                position: absolute;
                top: -3px;
                height: 20px;
                width: 20px;
                border-radius: 50%;
                box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.6);
                transition: -webkit-transform linear .08s, background-color linear .08s;
                transition: transform linear .08s, background-color linear .08s;
                will-change: transform;
                background-color: #fafafa;

                @apply --pebble-toggle-button-unchecked-button;
            }

            .toggle-button.dragging {
                -webkit-transition: none;
                transition: none;
            }

            :host([checked]:not([disabled])) .toggle-bar {
                opacity: var(--pebble-toggle-button-bar-opacity,0.5);
                background-color: var(--pebble-toggle-button-checked-bar-color, var(--primary-color));

                @apply --pebble-toggle-button-checked-bar;
            }

            :host([disabled]) .toggle-bar {
                background-color: #000;
                opacity: 0.12;
            }
            :host([disabled]) .toggle-button {
                background-color: #E0E0E0 !important;
            }

            :host([checked]) .toggle-button {
                -webkit-transform: translate(16px, 0);
                transform: translate(16px, 0);
            }

            :host([checked]:not([disabled])) .toggle-button {
                background-color: var(--pebble-toggle-button-checked-button-color, var(--primary-color));

                @apply --pebble-toggle-button-checked-button;
            }

            :host([disabled]) .toggle-button {
                background-color: #bdbdbd;
                opacity: 1;
            }

            .toggle-ink {
                position: absolute;
                top: -14px;
                left: -14px;
                width: 48px;
                height: 48px;
                opacity: 0.5;
                pointer-events: none;
                color: var(--pebble-toggle-button-unchecked-ink-color, var(--primary-text-color));
            }

            :host([checked]) .toggle-ink {
                color: var(--pebble-toggle-button-checked-ink-color, var(--primary-color));
            }

            .toggle-container {
                display: inline-block;
                vertical-align: middle;
                position: relative;
                width: 36px;
                height: 14px;
                /* The toggle button has an absolute position of -3px; The extra 1px
                /* accounts for the toggle button shadow box. */
                margin: 4px 1px;
                cursor:pointer;
            }

            .toggle-label {
                position: relative;
                display: inline-block;
                vertical-align: middle;
                padding-left: var(--pebble-toggle-button-label-spacing, 8px);
                white-space: normal;
                pointer-events: none;
                color: var(--pebble-toggle-button-label-color, var(--primary-text-color));
            }           
        </style>

        <div class="toggle-container">
            <div id="toggleBar" class="toggle-bar"></div>
            <div id="toggleButton" class="toggle-button"></div>
        </div>

        <div class="toggle-label"><slot></slot></div>
`;
  }

  static get is() {
      return "pebble-toggle-button";
  }
  static get properties() {
      return {
          checked: {
              type: Boolean,
              value: false
          }
      }
  }
  ready(){
      super.ready();
      this._ensureAttribute('role', 'button');
      this._ensureAttribute('aria-pressed', 'false');
      this._ensureAttribute('tabindex', 0);
  }
  connectedCallback() {
      super.connectedCallback();
      this.addEventListener('track', this._ontrack);
  }
  disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('track', this._ontrack);
  }
  _ontrack(event) {
      let track = event.detail;
      if (track.state === 'start') {
          this._trackStart(track);
      } else if (track.state === 'track') {
          this._trackMove(track);
      } else if (track.state === 'end') {
          this._trackEnd(track);
      }
  }

  _trackStart(track) {
      this._width = this.$.toggleBar.offsetWidth / 2;
      /*
       * keep an track-only check state to keep the dragging behavior smooth
       * while toggling activations
       */
      this._trackChecked = this.checked;
      this.$.toggleButton.classList.add('dragging');
  }

  _trackMove(track) {
      let dx = track.dx;
      this._x = Math.min(this._width,
          Math.max(0, this._trackChecked ? this._width + dx : dx));
      this.translate3d(this._x + 'px', 0, 0, this.$.toggleButton);
      this._userActivate(this._x > (this._width / 2));
  }

  _trackEnd(track) {
      this.$.toggleButton.classList.remove('dragging');
      this.transform('', this.$.toggleButton);
  }

  // customize the element's ripple
  _createRipple() {
      this._rippleContainer = this.$.toggleButton;
      let ripple = PaperRippleBehavior._createRipple();
      ripple.id = 'ink';
      ripple.setAttribute('recenters', '');
      ripple.classList.add('circle', 'toggle-ink');
      return ripple;
  }
}
customElements.define(PebbleToggleButton.is, PebbleToggleButton);
