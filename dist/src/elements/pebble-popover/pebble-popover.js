/**
`<pebble-popover>` Represents a popover raised for a target.

### Example

    <pebble-button id="simpleButton" button-text="Test Button" onclick="buttonpopover.show()"></pebble-button>
    <pebble-popover id="buttonpopover" for="simpleButton" no-overlap>
        Popover simple text.                    
    </pebble-popover>

### Styling

The following custom properties and mixins are available for styling:

Custom property | Description | Default
----------------|-------------|---------
`--pebble-popover-background-color` | The background color of the popover | `#ffffff`
`--pebble-popover-text-color` | The color of the popover text | `#000000`
`--pebble-popover-max-height` | The max height of the popover | `300px`
`--pebble-popover-max-width` | The max width of the popover | `300px`
`--pebble-popover-height` | The height of the popover | ``
`--pebble-popover-width` | The width of the popover | ``

### Accessibility

See the docs for `Polymer.IronOverlayBehavior` for accessibility features implemented by this element.

@group Pebble Elements
@element pebble-popover
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { IronDropdownScrollManager } from '@polymer/iron-dropdown/iron-dropdown-scroll-manager.js';
import { IronOverlayBehavior } from '@polymer/iron-overlay-behavior/iron-overlay-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
//To capture current opened popover
let currentPopover = null;
class PebblePopover extends mixinBehaviors([RUFBehaviors.UIBehavior, IronOverlayBehavior], PolymerElement) {
  static get template() {
    return Polymer.html`
    <style include="bedrock-style-common bedrock-style-scroll-bar">
      :host {
        display: inline-table;
        position: absolute;
        background-color: var(--pebble-popover-background-color, #ffffff);
        color: var(--primary-text-color, #212121);
        border: 0;
        border-radius: var(--default-border-radius, 3px);
        font-size: var(--default-font-size, 14px);
        box-shadow: 0 0 var(--popup-box-shadow-size, 8px) 0 var(--popup-box-shadow, #8A98A3);
        background: var(--palette-white);
        @apply --pebble-popover;
      }

      .popover {
        display: block;
        border-radius: 3px;
        height: var(--pebble-popover-height);
        width: var(--pebble-popover-width);
        padding-top: var(--default-popup-t-p, 20px);
        padding-bottom: var(--default-popup-b-p, 20px);
        @apply --popover;
      }

      :host(.popover-list) .popover {
        padding: 0 !important;
      }

      .arrow_box:before,
      .arrow_box:after {
        display: none;
      }
    </style>
    <div class="arrow_box">
      <div class="popover">
        <slot>
        </slot>
      </div>
    </div>
`;
  }

  static get is() {
    return "pebble-popover";
  }

  static get properties() {
    return {
      /**
       * Performance fix for iron-fit-behavior (used by iron-overlay-behavior)
       * */
      _isRTL: {
        type: Boolean,
        value: false
      },
      /*
       *  Indicates the target for popover to display.
       */
      for: {
        type: String,
        value: null
      },
      autoFitOnAttach: {
        type: Boolean,
        value: false
      },
      /*
       *  Specifies that popover is aligned vertically.
       *  If the value is specified as "bottom", then the popover is placed above the target.
       *  If the value is specified as "top", then the popover is placed below the target.
       *  If the value is specified as "auto", then the popover is placed as per the available space.            
       */
      verticalAlign: {
        type: String,
        value: "auto"
      },
      /*
       *  Specifies that popover is aligned horizontally.
       *  If the value is specified as "left", then the popover is placed to the left of the target.
       *  If the value is specified as "right", then the popover is placed to the right of the target.
       *  If the value is specified as "auto", then the popover is placed as per the available space.
       *  
       */
      horizontalAlign: {
        type: String,
        value: "auto"
      },
      /*
       *  Specifies the popover not to overlap with target. It indicates the `Overlay behavior`.
       */
      noOverlap: {
        type: Boolean,
        value: true
      },
      /*
       *  Indicates display arrow as per target without any position calculations.
       */
      displayArrowAsPerTarget: {
        type: Boolean,
        value: false
      },
      /**
       * Indicates whether to show multiple popovers or not
       */
      allowMultiple: {
        type: Boolean,
        value: false
      },
      /**
       * Indicates not to show arrow
       */
      showCaret: {
        type: Boolean,
        value: false
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('iron-overlay-opened', this._popoverOpened);
    this.addEventListener('iron-overlay-closed', this._popoverClosed);
    this._closePopover = this._closePopover.bind(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('iron-overlay-opened', this._popoverOpened);
    this.removeEventListener('iron-overlay-closed', this._popoverClosed);
  }

  _closePopover(event) {
    let popoverFound = false;
    let path = event.path || event.composedPath();
    for (let key = 0; key < path.length; key++) {
      if (path[key].tagName) {
        if (path[key].tagName == "PEBBLE-POPOVER") {
          popoverFound = true;
          break;
        }
      }
    }

    if (!popoverFound) {
      this.close();
    }
  }

  _fixPopoverOnScrollAndResize() {
    if (currentPopover == null) {
      return;
    }

    currentPopover.refitPopover();
  }

  show(doNotSetTarget) {
    this.open(); //IronOverlayBehavior to display popover
    if (!doNotSetTarget) {
      let scope = dom(this).getOwnerRoot();
      let target = dom(scope).querySelector('#' + this.for);
      this.positionTarget = target;
    }
    this._updateAlign();
  }

  hide() {
    this.close();
  }

  /*
   *  Update alignment based on properties
   */
  _updateAlign(e) {
    this.refitPopover();
  }

  /*
   *  Can be used to reset the position of the popover and arrow.
   */
  refitPopover() {
    if (this.positionTarget) {
      this.refit();
      //After resetting the popover, now fix the arrow position
      this._fitArrowPosition();
    }
  }

  /*
   * Raised when popover opens, initial arrow position will be set from here
   */
  _popoverOpened(e) {
    if (currentPopover != null && currentPopover != this && !this.allowMultiple) {
      currentPopover.close();
    }

    if (currentPopover) {
      IronDropdownScrollManager.removeScrollLock(currentPopover);
    }

    currentPopover = this;

    this._fitArrowPosition();

    IronDropdownScrollManager.pushScrollLock(currentPopover);

    this.fireBedrockEvent("on-popover-open", null, {
      ignoreId: true
    });
    ComponentHelper.fireBedrockEvent("on-popover-open-focus", null, {
      ignoreId: true
    });

    window.addEventListener('scroll', this._fixPopoverOnScrollAndResize, true);
    window.addEventListener('resize', this._fixPopoverOnScrollAndResize, true);
    document.addEventListener('down', this._closePopover, true);
  }

  getControlIsDirty() {
    return this.opened;
  }

  _popoverClosed() {
    //If popover opened, then do NOT make it to null and just return back
    if (currentPopover && currentPopover.opened) {
      return;
    }

    if (currentPopover) {
      IronDropdownScrollManager.removeScrollLock(currentPopover);
    }

    currentPopover = null;

    this.fireBedrockEvent("on-popover-close", null, {
      ignoreId: true
    });
    window.removeEventListener('scroll', this._fixPopoverOnScrollAndResize, true);
    window.removeEventListener('resize', this._fixPopoverOnScrollAndResize, true);
    document.removeEventListener('down', this._closePopover, true);
  }

  _fitArrowPosition() {
    if (!this.showCaret) {
      return;
    }
    let scope = dom(this).getOwnerRoot();
    let targetBounding = dom(scope).querySelector('#' + this.for).getBoundingClientRect();
    let popoverBounding = this.getBoundingClientRect();
    //Popover opened first time, so popover size not determined yet and now return back
    if (popoverBounding.width == 0) {
      return;
    }
    let arrowType = '';
    let arrowPositionLeft = '';
    let arrowPositionBottom = '';
    let arrowboxsize = 16;
    let padding = 5;
    let margin = 5;
    let arrowMarginBottom = '0px';
    //When user adjusted the popover position, implemented for up and down arrows
    if (this.displayArrowAsPerTarget) {
      arrowPositionLeft = (targetBounding.left - popoverBounding.left) + targetBounding.width / 2;
      if (targetBounding.bottom < popoverBounding.top) {
        arrowType = 'up';
        arrowPositionBottom = '100%';
        arrowMarginBottom = padding + 'px';
      } else {
        arrowType = 'down';
        arrowPositionBottom = -(arrowboxsize + margin);
      }
    } else if (targetBounding.bottom < popoverBounding.top) //Popover below the target
    {
      arrowType = 'up';
      if (targetBounding.left < popoverBounding.left) {
        arrowPositionLeft = (targetBounding.right - popoverBounding.left) / 2;
        if (arrowPositionLeft > (popoverBounding.right - popoverBounding.left)) //When target is bigger than popover
        {
          arrowPositionLeft = (popoverBounding.right - popoverBounding.left) / 2;
        }
      } else {
        arrowPositionLeft = (targetBounding.left - popoverBounding.left) + targetBounding.width / 2 -
          arrowboxsize;
      }
      arrowPositionBottom = '100%';
      arrowMarginBottom = padding + 'px';
    } else if (popoverBounding.bottom < targetBounding.top) //Popover above the target
    {
      arrowType = 'down';
      if (targetBounding.left < popoverBounding.left) {
        arrowPositionLeft = (targetBounding.right - popoverBounding.left) / 2;
        if (arrowPositionLeft > (popoverBounding.right - popoverBounding.left)) //When target is bigger than popover
        {
          arrowPositionLeft = (popoverBounding.right - popoverBounding.left) / 2;
        }
      } else {
        arrowPositionLeft = (targetBounding.left - popoverBounding.left) + targetBounding.width / 2;
      }
      arrowPositionBottom = -(arrowboxsize + margin);
    } else if (targetBounding.right < popoverBounding.left) //Popover right side of the target
    {
      arrowType = 'left';
      if (targetBounding.bottom > popoverBounding.bottom) {
        arrowPositionBottom = popoverBounding.height - (targetBounding.bottom - popoverBounding.top);
      } else {
        arrowPositionBottom = popoverBounding.height - (targetBounding.bottom - popoverBounding.top) - (
          padding + margin);
      }
      arrowPositionLeft = -(arrowboxsize);
    } else //Popover left side of the target
    {
      arrowType = 'right';
      if (targetBounding.bottom > popoverBounding.bottom) {
        arrowPositionBottom = popoverBounding.height - (targetBounding.bottom - popoverBounding.top);
      } else {
        arrowPositionBottom = popoverBounding.height - (targetBounding.bottom - popoverBounding.top) - (
          padding + margin);
      }
      arrowPositionLeft = popoverBounding.width;
    }
    this._enableArrow(arrowType);
    let arrowPositionBottomValue = '100%';
    if (arrowPositionBottom != '100%') {
      arrowPositionBottomValue = arrowPositionBottom + 'px';
    }
    this.updateStyles({
      '--arrow-position-bottom': arrowPositionBottomValue,
      '--arrow-position-left': arrowPositionLeft + 'px',
      '--arrow-margin-bottom': arrowMarginBottom + 'px'
    });
  }

  _enableArrow(type) {
    let upArrow = '';
    let downArrow = '';
    let leftArrow = '';
    let rightArrow = '';
    let upArrowBorderColor = '';
    let downArrowBorderColor = '';
    let leftArrowBorderColor = '';
    let rightArrowBorderColor = '';

    let backgroundColor = window.getComputedStyle(this, null).getPropertyValue('background-color');
    if (type == 'right') {
      rightArrow = backgroundColor;
      rightArrowBorderColor = 'rgba(0, 0, 0, 0.26)';
    } else if (type == 'left') {
      leftArrow = backgroundColor;
      leftArrowBorderColor = 'rgba(0, 0, 0, 0.26)';
    } else if (type == 'down') {
      downArrow = backgroundColor;
      downArrowBorderColor = 'rgba(0, 0, 0, 0.26)';
    } else {
      upArrow = backgroundColor;
      upArrowBorderColor = 'rgba(0, 0, 0, 0.26)';
    }
    this.updateStyles({
      '--up-arrow': upArrow,
      '--down-arrow': downArrow,
      '--left-arrow': leftArrow,
      '--right-arrow': rightArrow,
      '--up-arrow-border-color': upArrowBorderColor,
      '--down-arrow-border-color': downArrowBorderColor,
      '--left-arrow-border-color': leftArrowBorderColor,
      '--right-arrow-border-color': rightArrowBorderColor
    });

  }
}
customElements.define(PebblePopover.is, PebblePopover);
