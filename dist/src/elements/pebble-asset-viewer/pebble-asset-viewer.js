import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/paper-fab/paper-fab.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
// import { importHref } from '@polymer/polymer/lib/utils/import-href.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
class PebbleAssetViewer extends OptionalMutableData(PolymerElement) {
  static get template() {
    return Polymer.html`
        <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-icons bedrock-style-padding-margin"></style>
        <template is="dom-if" if="[[assetUrl]]">
            <style>
                :host *{
                    user-select: none;
                }
                .asset-render {
                    height: 80vh;
                    position: relative;
                    padding-top: 40px;
                }

                #viewerContainer {
                    text-align: center;
                }

                .asset-render img {
                    max-width: 100%;
                }

                .video-extension-not-supported {
                    position: absolute;
                    left: 40%;
                    top: 50%;
                }

                .pdf-navaigation {
                    position: fixed;
                    bottom: 10%;
                    z-index: 1;
                    left: 50%;
                    transform: translateX(-50%);
                }

                .pdf-navaigation pebble-icon {
                    display: inline-block;
                }

                .pdf-navaigation .nav-text {
                    display: inline-block;
                    font-size: 12px;
                }
                pdf-viewer{
                    height:calc(100% + 20px);
                }

                .download {
                    position: absolute;
                    right: 0;
                    top: 0;
                    padding: 3px 10px;
                    border: 1px solid transparent;
                    font-size: var(--default-font-size, 14px);
                    border-radius: 3px;
                    text-transform: capitalize;
                    color: var(--button-text-color, #ffffff) !important;
                    background-color: var(--success-button-color, #09c021);
                    border-color: var(--success-button-color, #09c021);
                    text-decoration: none;
                }

                video::-webkit-media-controls-fullscreen-button {
                    display: none;
                }

                .modal-content-wrapper {
                    width: 100%;
                    height: 100%;
                    overflow: auto;
                }
            </style>
            <div id="viewerContainer" class\$="[[_computeClass(assetType)]]">
                <pebble-spinner active="[[_loading]]"></pebble-spinner>
                <template is="dom-if" if="[[isImageView(assetType)]]">
                    <template is="dom-if" if="[[!isPublicUrl]]">
                        <a href\$="[[assetUrl]]" download="" class="download">
                            <pebble-icon icon="pebble-icon:download-asset" class="download-icon pebble-icon-size-16 pebble-icon-color-white m-r-5"></pebble-icon> Download
                        </a>
                    </template>
                    <div class="modal-content-wrapper">
                        <img class="modal-content" src\$="[[assetUrl]]" id="bigImage" sizing="contain" onload="[[_onAssetLoad]]">
                    </div>
                </template>
                <template is="dom-if" if="[[isVideoView(assetType)]]">
                    <template is="dom-if" if="[[assetError]]">
                        <div class="video-extension-not-supported">
                            <span>Video extension not supported. Click
                                <a href\$="[[assetUrl]]">here</a> to Download</span>
                        </div>
                    </template>
                    <template is="dom-if" if="[[!assetError]]">
                        <video id="videoPlay" controls="" autoplay="" src\$="[[assetUrl]]" height="100%" width="100%" oncanplay="[[_onAssetLoad]]" onerror="[[_onAssetError]]"></video>
                    </template>
                </template>
                <template is="dom-if" if="[[isDocumentView(assetType)]]">
                    <template is="dom-if" if="[[assetError]]">
                        <span>Document preview not available. Click
                            <a href\$="[[assetUrl]]">here</a> to Download</span>
                    </template>
                    <template is="dom-if" if="[[!assetError]]">
                        <a href\$="[[assetUrl]]" class="download">
                            <pebble-icon icon="pebble-icon:download-asset" class="download-icon pebble-icon-size-16 pebble-icon-color-white m-r-5"></pebble-icon> Download
                        </a>
                        <div class="pdf-navaigation">
                            <pebble-icon icon="pebble-icon:navigation-action-forward" action="previous" on-tap="_performDocumentAction" class="pebble-icon-size-20 pebble-icon-color-grey m-r-5"></pebble-icon>
                            <div class="nav-text">[[documentPage]]&nbsp;/&nbsp;[[documentPages]]</div>
                            <pebble-icon icon="pebble-icon:navigation-action-back" action="next" on-tap="_performDocumentAction" class="pebble-icon-size-20 pebble-icon-color-grey m-l-5"></pebble-icon>
                        </div>
                    </template>
                </template>
                <template is="dom-if" if="[[isAudioView(assetType)]]">
                    <audio id="audioPlay" controls="" autoplay="" src\$="[[assetUrl]]" oncanplay="[[_onAssetLoad]]"></audio>
                </template>
            </div>
        </template>
`;
  }

  static get is() {
      return 'pebble-asset-viewer'
  }

  static get properties() {
      return {
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
          _loading: {
              type: Boolean,
              value: false
          },
          assetError: {
              type: Boolean,
              value: false
          },
          documentPage: {
              type: Number,
              value: 1
          },
          documentPages: {
              type: Number,
              notify: true
          },
          isPublicUrl: {
              type: Boolean,
              value: false
          }
      }
  }
  static get observers() {
      return [
          '_onAssetValuesChange(assetType, assetUrl, assetExtension)'
      ]
  }

  _onAssetLoad() {
      let viewer = this.__dataHost.parentModel;
      viewer.set("_loading", false);
  }
  _onAssetError() {
      let viewer = this.__dataHost.parentModel;
      viewer.set("_loading", false);
      viewer.$.viewerContainer.classList.remove("asset-render");
      viewer.set("assetError", true);
  }
  isImageView(assetType) {
      if (assetType == "image") {
          this.set("_loading", true);
          return true;
      }
      return false;
  }
  isVideoView(assetType) {
      if (assetType == "video") {
          this.set("_loading", true);
          return true;
      }
      return false;
  }
  isDocumentView(assetType) {
      if (assetType == "document") {
          if (this.assetExtension != "pdf") {
              this.set("assetError", true);
          }
          return true;
      }
      return false;
  }
  isAudioView(assetType) {
      if (assetType == "audio") {
          return true;
      }
      return false;
  }
  _onAssetValuesChange(assetType, assetUrl, assetExtension) {
      if (assetType && assetUrl && assetExtension) {
          let self = this;
          if (this.assetType == "document" && this.assetExtension == "pdf") {
              if (!this.shadowRoot.querySelector("pdf-viewer")) {
                  let link = importHref("../../../bower_components/pdf-viewer/pdf-viewer.html", function () {
                      let dynamicEl = document.createElement("pdf-viewer");
                      dynamicEl.setAttribute("id", "docViewer");
                      dynamicEl.setAttribute("src", assetUrl);
                      dynamicEl.setAttribute("page", self.documentPage);
                      dynamicEl.setAttribute("mode", "single");
                      dynamicEl.setAttribute("initial-zoom", "fit-width");
                      dom(self.shadowRoot.querySelector("#viewerContainer")).appendChild(dynamicEl);
                  });
              }
          }
      }
  }
  _computeClass(assetType) {
      //compute class if no error is there
      if (!this.assetError) {
          if (assetType == "image" || assetType == "video" || assetType == "document") {
              return "asset-render";
          }
      }
  }
  _performDocumentAction(event) {
      this._docViewer = this._docViewer || this.shadowRoot.querySelector("#docViewer");
      let document = this._docViewer;
      this.set("documentPage", document.page);
      this.set("documentPages", document.pages);
      let action = event.target.getAttribute("action")

      switch (action) {
          case "previous":
              document.previous();
              break;
          case "next":
              document.next();
              break;
          case "full":
              document.fitWidth();
              break;
          case "fit":
              document.fit();
              break;
          case "zoomin":
              document.zoomin();
              break;
          case "zoomout":
              document.zoomout();
              break;
          default:
              alert("No Action")
              break;
      }
  }
  onClose() {
      if (this.assetType == "audio") {
          let audio = this.shadowRoot.querySelector("#audioPlay");
          audio.pause();
      } else if (this.assetType == "video") {
          let video = this.shadowRoot.querySelector("#videoPlay");
          video.pause();
      }
  }
}
customElements.define(PebbleAssetViewer.is, PebbleAssetViewer)
