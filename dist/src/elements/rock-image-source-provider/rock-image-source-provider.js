/**
`rock-image-source-provider` Represents an element that provides src for an image.

@group rock Elements
@element rock-image-source-provider
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../liquid-rest/liquid-rest.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockImageSourceProvider
extends mixinBehaviors([
    RUFBehaviors.UIBehavior
], PolymerElement) {
  static get template() {
    return Polymer.html`

`;
  }

  static get is() {
      return 'rock-image-source-provider'
  }
  static get properties() {
      return {
          noThumbnailImagePath: {
              type: String,
              value: "/src/images/no-thumbnail.svg"
          },
          loadingThumbnailPath: {
              type: String,
              value: "/src/images/loading-thumbnail.svg"
          },
          imageSource: {
              type: Object,
              value: function () {
                  return {}
              },
              notify: true
          }
      }
  }


  ready() {
      super.ready();
      this.imageSource = this._imageSource.bind(this);
  }
  _imageSource(data) {
      if (data && data.target) {
          if (data.imageId) {
              this._generateGetThumbnailRequest(data);
          } else {
              data.target.set("src", this.noThumbnailImagePath);
          }
      }
  }
  _generateGetThumbnailRequest(data) {
      let target = data.target;
      let imageId = data.imageId;

      if (imageId) {
          let liqRestElementDefinition = customElements.get('liquid-rest');
          let liquidElement = new liqRestElementDefinition();
          liquidElement.url = "/data/pass-through/binaryobjectservice/get";
          liquidElement.method = "POST";
          liquidElement.id = "liquid" + target.id;
          DataHelper.oneTimeEvent(liquidElement, 'liquid-response', this._onGetThumbnailResponse.bind(
              this, target));

          target.set("src", this.loadingThumbnailPath);

          let req = {
              "params": {
                  "query": {
                      "id": imageId,
                      "filters": {}
                  },
                  "fields": {}
              }
          };

          req.params.query.filters.typesCriterion = ["imagerendition"];
          req.params.fields.attributes = ["blob"];
          liquidElement.requestData = req;
          liquidElement.generateRequest();
      } else {
          target.set("src", this.noThumbnailImagePath);
      }
  }
  _onGetThumbnailResponse(target, e) {
      let thumbnail;
      if (e.detail && e.detail.response && e.detail.response.response) {
          let response = e.detail.response.response;
          if (response.status.toLowerCase() == "success") {
              let binaryObjects = response.binaryObjects;
              if (binaryObjects) {
                  let binaryObject = binaryObjects[0];
                  if (binaryObject.data) {
                      thumbnail = binaryObject.data.blob;
                      if (target.id != binaryObject.id) {
                          return;
                      }
                  }
              }
          }
          if (thumbnail) {
              // decode the base64 and find the mime type. This is needed to display image/svg+xml images
              let c = Base64.decode(thumbnail);

              if (63039 == c.charCodeAt(0)) {
                  e = "image/jpeg";
              } else if (37902 == c.charCodeAt(0)) {
                  e = "image/png";
              } else if (0 == c.indexOf("GIF")) {
                  e = "image/gif";
              } else if (0 == c.indexOf("BM")) {
                  e = "image/bmp";
              } else if (0 < c.indexOf("\x3csvg")) {
                  e = "image/svg+xml";
              } else {
                  e = "image";
              }

              let imgSrc = "data:" + e + ";base64," + thumbnail;
              target.set("src", imgSrc);
          } else {
              target.set("src", this.noThumbnailImagePath);
          }
      }
  }
}
customElements.define(RockImageSourceProvider.is, RockImageSourceProvider);
