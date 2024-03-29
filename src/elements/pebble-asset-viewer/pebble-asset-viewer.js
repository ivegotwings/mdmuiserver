import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/paper-fab/paper-fab.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';
class PebbleAssetViewer extends OptionalMutableData(PolymerElement) {
  static get template() {
    return html`
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

                .asset-extension-not-supported {
                    position: absolute;
                    left: 40%;
                    top: 50%;
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
                    <template is="dom-if" if="[[assetError]]">
                        <div class="asset-extension-not-supported">
                            <span>File extension not supported. <a href\$="[[assetUrl]]">Click here to download</a></span>
                        </div>
                    </template>
                    <template is="dom-if" if="[[!assetError]]">
                        <div class="modal-content-wrapper">
                            <img class="modal-content" src\$="[[assetUrl]]" id="bigImage" sizing="contain" onload="[[_onAssetLoad]]" onerror="[[_onAssetError]]">
                        </div>
                    </template>
                </template>
                <template is="dom-if" if="[[isVideoView(assetType)]]">
                    <template is="dom-if" if="[[assetError]]">
                        <div class="asset-extension-not-supported">
                            <span>Video extension not supported. <a href\$="[[assetUrl]]">Click here to download</a></span>
                        </div>
                    </template>
                    <template is="dom-if" if="[[!assetError]]">
                        <video id="videoPlay" controls="" autoplay="" src\$="[[assetUrl]]" height="100%" width="100%" oncanplay="[[_onAssetLoad]]" onerror="[[_onAssetError]]"></video>
                    </template>
                </template>
                <template is="dom-if" if="[[isDocumentView(assetType)]]">
                        <span>Document preview not available. <a href\$="[[assetUrl]]">Click here to download</a></span>
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

  _onAssetLoad() {
      let viewer = this.__dataHost.parentModel;
      viewer.set("_loading", false);
  }
  _onAssetError() {
      let viewer = this.__dataHost.parentModel;
      viewer.set("_loading", false);
      let viewContainer = viewer.shadowRoot.querySelector("#viewerContainer");
      if(viewContainer){
        viewContainer.classList.remove("asset-render");
      }
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
          this.set("assetError", true);
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

  _computeClass(assetType) {
      //compute class if no error is there
      if (!this.assetError) {
          if (assetType == "image" || assetType == "video") {
              return "asset-render";
          }
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
