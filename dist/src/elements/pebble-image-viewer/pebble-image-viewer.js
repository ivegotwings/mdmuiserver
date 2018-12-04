import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../bedrock-lazy-load-behavior/bedrock-lazy-load-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebbleImageViewer extends mixinBehaviors([RUFBehaviors.LazyLoadBehavior], PolymerElement) {
  static get template() {
    return Polymer.html`
    <style>
      :host {
        display: inline-block;
        overflow: hidden;
        position: relative;
      }

      #img {
        width: var(--pebble-image-width, 100%);
        height: var(--pebble-image-height, 100%);
      }

      #img:hover {
        opacity: 0.7;
        cursor: pointer;
      }

      /* Modal Content (image) */

      .modal-content {
        margin: auto;
        display: block;
        width: 80%;
        max-width: 700px;
        max-height: auto;
      }

      /* The Close Button */

      .close {
        position: absolute;
        top: 2px;
        right: 2px;
        color: #f1f1f1;
        font-size: 40px;
        font-weight: var(--font-bold, bold);
        transition: 0.3s;
        -webkit-transition: 0.3s;
      }

      .close:hover,
      .close:focus {
        color: #bbb;
        text-decoration: none;
        cursor: pointer;
      }

      /* 100% Image Width on Smaller Screens */

      @media only screen and (max-width: 700px) {
        .modal-content {
          width: 100%;
        }
      }

      #sizedImgDiv {
        background-color: inherit;
        background-repeat: no-repeat;
        background-position: center;
        position: absolute;
        top: 0px;
        right: 0px;
        bottom: 0px;
        left: 0px;
        cursor: pointer;
      }

      .circle {
        border-radius: 50%;
      }
    </style>

    <div id="sizedImgDiv" role="img" hidden\$="[[!_isImgHidden()]]"></div>

    <img id="img" hidden\$="[[_isImgHidden()]]" alt\$="[[alt]]">
`;
  }

  static get is() {
    return "pebble-image-viewer";
  }
  static get properties() {
    return {
      /**
       * Indicates the URL of a primary image.
       * @type String
       * @default null
       */
      src: {
        type: String,
        value: null
      },

      /**
       * Indicates a short text that is alternative for an image.
       * @type String
       * @default null
       */
      alt: {
        type: String,
        value: null
      },

      sizing: {
        type: String,
        value: null,
        reflectToAttribute: true
      },

      placeholder: {
        type: String,
        value: null
      },

      loaded: {
        notify: true,
        type: Boolean,
        value: false
      },

      /**
       * Indicates the outline of the image thumbnail.
       * Only `circle` is valid value for this.
       * If it is set to <b>null</b>, then the outline is box based on the thumbnail dimensions and element style.
       * @attribute shape
       * @type String
       * @default null
       */
      shape: {
        type: String,
        value: null,
        observer: '_shapeChanged'
      },

      assetDetails: {
        type: Object,
        notify: true
      }
    }
  }
  static get observers() {
    return [
      '_loadImage(src)'
    ]
  }
  constructor() {
    super();
    this._resolvedSrc = '';
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('tap', this.enlargeImage);
  }
  _isImgHidden() {
    return !!this.sizing;
  }

  _loadImage(src) {
    if (!src) return;

    this.$.img.src = src;

    if (this.sizing) {
      const sizedImg = this.$.sizedImgDiv;

      sizedImg.style.backgroundImage = `url("${src}")`;
      sizedImg.style.backgroundSize = this.sizing;
      if(src.includes("no-thumbnail")){
        sizedImg.style.cursor = "default";
      }
    }
  }
  _shapeChanged() {
    if (this.shape !== "circle") return;

    this.$.img.classList.add(this.shape);
  }

  enlargeImage() {
    let imageItem = this.assetDetails;
    
    if(imageItem){
      this.dispatchEvent(new CustomEvent('enlarge-asset', {detail: {data: imageItem,name:"view-by-item"}, bubbles:true, composed:true}));
    } else if(this.src !== "/src/images/no-thumbnail.svg"){
        this.dispatchEvent(new CustomEvent('enlarge-asset', {detail: {data: this.src, name:"view-by-src"}, bubbles:true, composed:true}));
    } 
  }
}
customElements.define(PebbleImageViewer.is, PebbleImageViewer);
