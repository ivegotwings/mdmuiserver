/**
`rock-image-viewer` Represents an element that displays an image.

@group pebble Elements
@element rock-image-viewer
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../pebble-dialog/pebble-dialog.js';
import '../pebble-asset-viewer/pebble-asset-viewer.js';
import '../pebble-image-viewer/pebble-image-viewer.js';
import '../bedrock-helpers/liquid-response-helper.js';
import '../liquid-rest/liquid-rest.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import EntityTypeManager from '../bedrock-managers/entity-type-manager.js'
class RockImageViewer extends  OptionalMutableData(PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                display: inline-block;
                overflow: hidden;
                position: relative;
            }

            pebble-image-viewer {
                width: 100%;
                height: 100%;
            }

            #bigImage {
                background-image: url(../../images/loader.gif);
                background-size: 30px 30px;
                background-repeat: no-repeat;
                background-attachment: fixed;
                background-position: center;
            }

            #pebbleModal {
                text-align: left;
            }
        </style>
        <liquid-entity-data-get id="getImageIdLiquid" operation="searchandget" on-response="_onGetImageIdResponse" on-error="_onSearchError" exclude-in-progress=""></liquid-entity-data-get>

        <liquid-entity-data-get id="getThumbnailLiquid" operation="getbyids" on-response="_onGetImagePropertiesResponse" exclude-in-progress=""></liquid-entity-data-get>
        <template is="dom-if" if="[[!_srcNotFound]]">
            <pebble-image-viewer id="imageView" lazy-load="" alt="[[alt]]" sizing="[[sizing]]" src="[[_src]]" active="{{active}}" asset-details="[[assetDetails]]"></pebble-image-viewer>
        </template>
        <template is="dom-if" if="[[_srcNotFound]]">
            [[src]]
        </template>
        <template is="dom-if" if="[[_isAssetViewerOpened]]">
            <pebble-dialog id="pebbleModal" on-tap="_onTapPopover" dialog-title="[[assetDetails.property_originalfilename]]" modal="" horizontal-align="auto" vertical-align="auto" enable-drag="" show-close-icon="" no-cancel-on-outside-click="" no-cancel-on-esc-key="">
                <template is="dom-if" if="[[assetUrl]]">
                    <pebble-asset-viewer asset-type="[[assetType]]" asset-url="[[assetUrl]]" asset-extension="[[assetExtension]]"></pebble-asset-viewer>
                </template>
            </pebble-dialog>
        </template>
`;
  }

  static get is() { return 'rock-image-viewer' }

  static get properties() {
      return {

          /**
           * Indicates the URL of a primary image.
           * @type String
           * @default null
           */
          src: {
              type: String,
              value: ""
          },
          _src: {
              type: String,
              value: ""
          },

          /**
           * Indicates a short text that is alternative for an image.
           * @type String
           * @default null
           */
          alt: {
              type: String,
              value: ""
          },

          /**
           * Specifies whether or not an image is prevented from load.
           * If it is set to <b>true</b>, then the image is prevented from the load and any placeholder is
           * shown. This is useful to prevent 404 requests when binding to the `src` property that is
           * known to be invalid.
           * @type Boolean
           * @default false
           */
          preventLoad: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates the sizing option for the image. The valid values are `contain`, `cover`, or `null`.
           * If the value is `contain`,then the full aspect ratio of the image is contained within the
           * element and is letter-boxed. If the value is `cover`, then the image is cropped in order to
           * fully cover the bounds of the element. If the value is `null`, then the image takes natural size.
           * @type String
           * @default null
           */
          sizing: {
              type: String,
              value: null
          },

          /**
           * Specifies whether or not the preload of the image is enabled.
           * If it is set to <b>true</b>, then any change to the `src` property causes the `placeholder`
           * image to be shown until the new image is loaded.
           * @type Boolean
           * @default false
           */
          preload: {
              type: Boolean,
              value: false
          },

          /**
           * Indicates a placeholder to place a background image.
           * This image is used as a background or placeholder until the `src` image is
           * loaded.  Use of a `data-URI` for placeholder is encouraged for instant rendering.
           * @type String
           * @default null
           */
          placeholder: {
              type: String,
              value: ""
          },

          /**
           * Specifies whether or not an image load has an animation.
           * If it is set to <b>true</b>, then it causes an image to
           * fade into place.
           * @type Boolean
           * @default false
           */
          fade: {
              type: Boolean,
              value: false
          },

          /**
           * Specifies whether or not an image is loaded.
           * If it is set to <b>true</b>, then the image is loaded.
           * @type Boolean
           * @default false
           */
          loaded: {
              notify: true,
              type: Boolean,
              value: false
          },

          /**
           * Indicates a value that tracks the load state of the image when the `preload`
           * option is used.
           * @type Boolean
           * @default false
           */
          loading: {
              notify: true,
              type: Boolean,
              value: false
          },

          /**
           * Specifies that the last set `src` is failed to load.
           * @type Boolean
           * @default false
           */
          error: {
              notify: true,
              type: Boolean,
              value: false
          },

          /**
           * Indicates the width of image. It is specified either via binding or CSS.
           * @type number
           * @default null
           */
          width: {
              type: Number
          },

          /**
           * Indicates the height of image. It is specified either via binding or CSS.
           * 
           *
           * @attribute height
           * @type number
           * @default null
           */
          height: {
              type: Number
          },

          /**
           * Indicates the outline of the image thumbnail.
           * The only valid value is `circle`.
           * If it is set to <b>null</b>, then the outline is box based on the thumbnail dimensions and element style.
           * @attribute shape
           * @type String
           * @default null
           */
          shape: {
              type: String,
              value: null
          },

          /**
           * Indicates the URL of the background image for primary image.
           * The background image pops up once the thumbnail is clicked.
           * The thumbnail is clickable if background image source is provided.
           * @attribute shape
           * @type String
           * @default null
           */
          bigImageSrc: {
              type: String,
              value: null
          },

          /**
           * Indicates the expected alignment of background image with the primary image place holder.
           * The valid values are `topleft`, `topright`, `bottomleft`, and `bottomright`.
           * The position is set according to the implied value.
           * If it is set to <b>null</b>, then the image pop-ups at center with the options such as `no-cancel-on-outside-click`, `no-cancel-on-esc-key`, and `with-backdrop`.
           * Use `--dailog-layout` mixin to set the background image size & styles.
           * @attribute alignment
           * @type String
           * @default null
           */
          alignment: {
              type: String,
              value: 'null'
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          thumbnailId: {
              type: String
          },
          noThumbnailImagePath: {
              type: String,
              value: "/src/images/no-thumbnail.svg"
          },
          loadingThumbnailPath: {
              type: String,
              value: "/src/images/loading-thumbnail.svg"
          },
          active: {
              type: Boolean,
              value: false
          },
          assetDetails: {
              type: Object
          },
          assetType: {
              type: String
          },
          assetUrl: {
              type: String,
              value: ""
          },
          assetExtension: {
              type: String
          },
          _srcNotFound: {
              type: Boolean,
              value: false
          },
          _isAssetViewerOpened: {
              type: Boolean,
              value: false
          },
          _defaultTitle: {
              type: String,
              value: "Image"
          },
          _imagePropertyGetRequest: {
              type: Object,
              value: function () {
                  return {}
              }
          },
          typesCriterion: {
              type: Array,
              value: function () {
                  return []
              }
          }
      }
  }
  static get observers() {
      return [
          "_generateGetThumbnailRequest(thumbnailId,active,src)"
      ]
  }
  disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('enlarge-asset', this._onAssetEnlargeEvent);
      this.removeEventListener('asset-popover-closed', this.assetPopoverClosed);
  }
  connectedCallback() {
      super.connectedCallback();
      let entityTypes = EntityTypeManager.getInstance().getTypesByDomain("digitalAsset");
      this.typesCriterion = entityTypes.filter(entityType => {
        return entityType.includes("rendition");
      });
      this.addEventListener('enlarge-asset', this._onAssetEnlargeEvent);
      this.addEventListener('asset-popover-closed', this.assetPopoverClosed);

  }

  _generateGetThumbnailRequest() {
      this.set("_srcNotFound", false);
      if (this.thumbnailId) {
          this.set("_src", this.loadingThumbnailPath);
          if (this.active) {
              let req = {
                  "params": {
                      "query": {
                          "id": this.thumbnailId,
                          "filters": {}
                      },
                      "fields": {}
                  }
              };
              if(_.isEmpty(this.typesCriterion)){
                this.typesCriterion = ["imagerendition"];
              }
              req.params.query.filters.typesCriterion = this.typesCriterion;
              req.params.fields.attributes = ["blob"];

              let getThumbnailLiquid = this._createLiquidRest("/data/pass-through/binaryobjectservice/get", this._onGetThumbnailResponse);

              if (getThumbnailLiquid) {
                  getThumbnailLiquid.requestData = req;
                  getThumbnailLiquid.generateRequest();
              }
          }
      } else if (this.src) {
          //checks the source exist and set
          this._imageExists(this.src).then(function (response) {
              if (response) {
                  this.set("_src", this.src);
              }
              else {
                  this.set("_srcNotFound", true);
              }
          }.bind(this));
      } else {
          this.set("_src", this.noThumbnailImagePath);
      }
  }
  _onGetThumbnailResponse(e) {
      let thumbnail;
      if (e.detail && e.detail.response && e.detail.response.response) {
          let response = e.detail.response.response;
          if (response.status.toLowerCase() == "success") {
              let binaryObjects = response.binaryObjects;
              if (binaryObjects) {
                  let binaryObject = binaryObjects[0];
                  if (binaryObject.data) {
                      thumbnail = binaryObject.data.blob;
                  }
              }
          }
          if (thumbnail) {
              // decode the base64 and find the mime type. This is needed to display image/svg+xml images
              let c = Base64.decode(thumbnail);

              if (63039 == c.charCodeAt(0)) {
                  e = "image/jpeg";
              }
              else if (37902 == c.charCodeAt(0)) {
                  e = "image/png";
              }
              else if (0 == c.indexOf("GIF")) {
                  e = "image/gif";
              }
              else if (0 == c.indexOf("BM")) {
                  e = "image/bmp";
              }
              else if (0 < c.indexOf("\x3csvg")) {
                  e = "image/svg+xml";
              }
              else {
                  e = "image";
              }

              let imgSrc = "data:" + e + ";base64," + thumbnail;

              this.set("_src", imgSrc);
          }
          else if (this.src) {
              this.thumbnailId = "";
              this._imageExists(this.src).then(function (response) {
                  if (response) {
                      this.set("_src", this.src);
                  }
                  else {
                      this.set("_srcNotFound", true);
                  }
              }.bind(this));
          }
          else {
              this.set("_src", this.noThumbnailImagePath);
          }
      }
  }
  _imageExists(image_url) {

      return new Promise(function (resolve, reject) {

          let img = new Image();
          img.onload = function () {
              resolve(true);
          }.bind(this);
          img.onerror = function () {
              resolve(false);
          }.bind(this);
          img.src = image_url;
      });
  }
  _onAssetEnlargeEvent(event) {
      let imageDetail = event.detail;
      if (imageDetail) {
          this._isAssetViewerOpened = true;
          if (imageDetail.name == "view-by-item") {
              //If item details are provided
              if (imageDetail.data.filetype) {
                  this.set("assetExtension", imageDetail.data.filetype);
              }
              else if (imageDetail.data.filenameextension) {
                  this.set("assetExtension", imageDetail.data.filenameextension);
              }
              this.set("assetType", imageDetail.data.type);
              let fileName = imageDetail.data.property_objectkey;
              this._getImageDownloadUrl(fileName);
          }
          else {
              /*If the operation is view by source and it has a thumbnailid, it request 
              for the id of the image using thumbnailid. After getting the image id it request
              for the image attributes and shows the image and download
              */
              if (this.thumbnailId) {
                  this._imagePropertyGetRequest = this._getImagePropertyGetRequest();
                  this._imagePropertyGetRequest.params.query.filters.attributesCriterion = [{ "thumbnailid": { "exact": this.thumbnailId } }];
                  let valueContext = DataHelper.getDefaultValContext();
                  if (valueContext) {
                      this._imagePropertyGetRequest.params.query.valueContexts = [valueContext];
                  }
                  let liq = this.shadowRoot.querySelector("#getImageIdLiquid");
                  if (liq) {
                      liq.requestData = this._imagePropertyGetRequest;
                      liq.generateRequest();
                  }
              }
              else {
                  //if public asset provided(currently done for only images)
                  this.set("assetExtension", "jpg");
                  this.set("assetType", "image");
                  this.set("assetUrl", imageDetail.data);

                  //Giving a pause to make pebble-asset-viewer available
                  this.async(function () {
                      let assetViewer = this.shadowRoot.querySelector("pebble-asset-viewer");
                      let modal = this.shadowRoot.querySelector("#pebbleModal");
                      if (assetViewer) {
                          assetViewer.set("isPublicUrl", true);
                          //Set default title if no original filename
                          if (!(this.assetDetails && this.assetDetails.property_originalfilename)) {
                              modal.dialogTitle = this._defaultTitle;
                          }
                          modal.open();
                      }
                  }, 10);
              }
          }
      }
  }
  _getImagePropertyGetRequest() {
      let request = {
          "params": {
              "query": {
                  "filters": {
                      "typesCriterion": [
                          "image"
                      ]
                  }
              },
              "fields": {
                  "attributes": [
                      "property_originalfilename",
                      "type",
                      "property_objectkey"
                  ]
              }
          }
      };
      return request;
  }
  _getImageDownloadUrl(fileName) {
      if (fileName) {
          let req = {
              "binaryStreamObject": {
                  "id": fileName,
                  "type": "binarystreamobject",
                  "data": {}
              }
          };
          let downloadUrlLiquid = this._createLiquidRest("/data/binarystreamobjectservice/prepareDownload", this._onGetDownloadUrlResponse);

          if (downloadUrlLiquid) {
              downloadUrlLiquid.requestData = [req];
              downloadUrlLiquid.generateRequest();
          }
      }
  }
  _onGetDownloadUrlResponse(e) {
      let modal = this.shadowRoot.querySelector("#pebbleModal");
      LiquidResponseHelper.downloadURLResponseMapper(e, downloadURL => {
          this.set("assetUrl", downloadURL);
          if (modal) {
              //Set default title if no original filename
              if (!(this.assetDetails && this.assetDetails.property_originalfilename)) {
                  modal.dialogTitle = this._defaultTitle;
              }
              modal.open();
          }
      });
  }
  _onGetImageIdResponse(e) {
      let response = e.detail.response;
      if (DataHelper.isValidObjectPath(response, 'content.entities.0')) {
          let imageId = response.content.entities[0].id;
          this._imagePropertyGetRequest.params.query.id = imageId;
          delete this._imagePropertyGetRequest.params.query.filters.attributesCriterion;
          let liq = this.shadowRoot.querySelector("#getThumbnailLiquid");
          if (liq) {
              liq.requestData = this._imagePropertyGetRequest;
              liq.generateRequest();
          }
      }
  }
  _onGetImagePropertiesResponse(e) {
      let response = e.detail.response;
      let imageDetail = {};
      if (DataHelper.isValidObjectPath(response, 'content.entities.0.data.attributes')) {
          let attributes = response.content.entities[0].data.attributes;
          if (!_.isEmpty(attributes)) {
              Object.keys(attributes).forEach(function (key) {
                  if (attributes[key].values) {
                      imageDetail[key] = attributes[key].values[0].value;
                  }
              });
              this.set("assetExtension", "jpg");
              this.set("assetType", imageDetail.type);
              let fileName = imageDetail.property_objectkey;

              this._getImageDownloadUrl(fileName);
          }
      }

  }
  assetPopoverClosed(e) {
      let pebbleAssetViewer = this.shadowRoot.querySelector("pebble-asset-viewer");
      if (pebbleAssetViewer) {
          pebbleAssetViewer.onClose();
      }
      this._isAssetViewerOpened = false;
  }
  _createLiquidRest(url, responseEvent) {
      let liquidElement = document.createElement("liquid-rest");
      liquidElement.url = url;
      liquidElement.method = "POST";
      DataHelper.oneTimeEvent(liquidElement, 'liquid-response', responseEvent.bind(this));

      return liquidElement;
  }
  _onTapPopover(event) {
      event.stopPropagation();
  }
}
customElements.define(RockImageViewer.is, RockImageViewer)
