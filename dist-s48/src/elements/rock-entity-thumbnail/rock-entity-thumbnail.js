/**
`<rock-entity-thumbnail>` Represents an element that renders the thumbnail for an entity.


@group rock Elements
@element rock-entity-thumbnail
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-component-context-behavior/bedrock-component-context-behavior.js';
import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../rock-image-viewer/rock-image-viewer.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityThumbnail
        extends mixinBehaviors([
            RUFBehaviors.ComponentContextBehavior,
            RUFBehaviors.UIBehavior
        ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style>
             :host {
                display: inline-block;
                overflow: hidden;
                position: relative;
            }

            rock-image-viewer {
                width: 100%;
                height: 100%;
            }
        </style>
        <liquid-entity-data-get id="getThumbnailLiquid" operation="getbyids" on-response="_onGetThumbnailResponse" exclude-in-progress=""></liquid-entity-data-get>
        <rock-image-viewer alt="Product image." sizing="contain" src="[[src]]" thumbnail-id="[[_thumbnailId]]" asset-details="[[assetDetails]]">
        </rock-image-viewer>
`;
  }

  static get is() {
      return 'rock-entity-thumbnail';
  }
  static get observers() {
      return [
          '_configChanged(config,contextData)'
      ]
  }

  static get properties() {
      return {
          config: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          /**
            * <b><i>Content development is under progress... </b></i> 
            */
          defaultThumbnailId: {
              type: String,
              value: ""
          },
          _thumbnailId: {
              type: String
          },
          noThumbnailImagePath: {
              type: String,
              value: "/src/images/no-thumbnail.svg"
          },
          src: {
              type: String,
              value: "/src/images/loading-thumbnail.svg"
          },
          assetDetails: {
              type: Object,
              notify: true
          },
          relationshipThumbnailIdentifier: {
              type: String,
              value: "thumbnailid"
          }
      }
  }

  /**
   * Specifies the configuration that rendered this component.
   */

  _configChanged () {
      this.refreshThumbnail();
  }
  refreshThumbnail() {
      if (!_.isEmpty(this.config) && !_.isEmpty(this.contextData)) {
          let relationshipName = this.config.relationshipName;
          this._thumbnailIdentifier = this.config.thumbnailIdentifier;
          let relCriteria = {};
          this._relationshipFilterAttributeName = this.config.relationshipFilterAttributeName;
          this._relationshipFilterAttributeValue = this.config.relationshipFilterAttributeValue;
          /*
          * TODO: Locale Coalesce is not implemented for relationships yet.
          * Because of this when we change locale from SDL to other, thumbnail
          * is not loaded in entity-header since thumbnailId is saved in SDL.
          * Hence temporarily adding default value Context in get request.
          * Remove default value context from get request once locale coalesce implemented for rels.
          */
          let req = DataRequestHelper.createEntityGetRequest(this.contextData, true);
          if (req) {
              req.params.fields.attributes = ["INTERNAL_DATAOBJECT_METADATA_FIELDS"];
              if(this._thumbnailIdentifier) {
                  req.params.fields.attributes.push(this._thumbnailIdentifier);
              }
              if (relationshipName) {
                  req.params.fields.relatedEntityAttributes = [this.relationshipThumbnailIdentifier,"property_objectkey","property_originalfilename"];
                  req.params.fields.relationships = [relationshipName];
                  req.params.fields.relationshipAttributes = [this._relationshipFilterAttributeName];
              }
          }
          let liq = this.shadowRoot.querySelector("#getThumbnailLiquid");
          if (liq) {
              liq.requestData = req;
              liq.generateRequest();
          }
      }
  }
  _onGetThumbnailResponse (event) {
      this._thumbnailId="";
      let respData = event.detail.response;
      let currentRel = "";
      if (DataHelper.isValidObjectPath(respData, 'content.entities.0.data.attributes.thumbnailid.values.0.value')) {
          this._thumbnailId = respData.content.entities[0].data.attributes.thumbnailid.values[0].value;
          return;
      }
      if (DataHelper.isValidObjectPath(event, "detail.request.requestData.params.fields.relationships.0")) {
          currentRel = event.detail.request.requestData.params.fields.relationships[0];
      }
      if (respData) {
          if (respData.content && respData.content.entities) {
              let entities = respData.content.entities;
              if (entities && entities.length > 0) {
                  let entityId = entities[0].id;
                  if (entityId) {
                      let entity = entities[0];
                      //Based on entity attribute
                      if(entity && entity.data && entity.data.attributes) {
                          let thumbnailId = AttributeHelper.getFirstAttributeValue(entity.data.attributes[this._thumbnailIdentifier]);
                          if(thumbnailId) {
                              this._thumbnailId = thumbnailId;
                              return;
                          }
                      }
                      //Based on entity properties
                      if (entity && entity.properties && entity.properties[this._thumbnailIdentifier]) {
                          this._thumbnailId = entity.properties[this._thumbnailIdentifier];
                          return;
                      }
                      let relationships = EntityHelper.getRelationshipsBasedOnContext(entity, ContextHelper.getFirstDataContext(this.contextData), true);
                      if (!_.isEmpty(relationships)) {
                          let relationshipDetails = relationships[currentRel];
                          if (relationshipDetails && relationshipDetails.length > 0) {
                              let primaryRel = undefined;
                              for (let i = 0; i < relationshipDetails.length; i++) {
                                  let relItem = relationshipDetails[i];
                                  let relAttributes = relItem.attributes;
                                  if (this._relationshipFilterAttributeName) {
                                      if (!relAttributes || !relAttributes.hasOwnProperty(this._relationshipFilterAttributeName)) {
                                          continue;
                                      } else {
                                          let attribute = relAttributes[this._relationshipFilterAttributeName];
                                          if (attribute && attribute.values) {
                                              let attributeValue = attribute.values[0].value;
                                              if (attributeValue == this._relationshipFilterAttributeValue.toString()) {
                                                  primaryRel = relItem;
                                                  break;
                                              }
                                          }
                                      }
                                  }
                              }

                              // if no primary image found then select first relationship..


                              if (primaryRel) {
                                  if (primaryRel.relTo) {
                                      if (primaryRel.relTo.data) {
                                          let item =this._createItemObject(primaryRel.relTo);
                                          this.set("assetDetails", item);
                                          let thumbnailIdAttribute = EntityHelper.getAttribute(primaryRel.relTo, this.relationshipThumbnailIdentifier);
                                          let thumbnailId = thumbnailIdAttribute.values[0].value;
                                          if (thumbnailId) {
                                              this._thumbnailId = thumbnailId;
                                              return;
                                          }
                                      }
                                  }
                              }
                          }
                      }
                  }
              }
          }
      }
      if (!this._thumbnailId) {
          if (this.defaultThumbnailId) {
              this._thumbnailId = this.defaultThumbnailId;
          } else {
              this.src = this.noThumbnailImagePath;
          }
      }
  }
  _createItemObject(relTo){
      let type = relTo.type;
      let attributes = relTo.data.attributes;
      if(attributes["property_objectkey"] && attributes["property_originalfilename"] && type){
          let item = {
              "property_objectkey":attributes["property_objectkey"].values[0].value,
              "property_originalfilename":attributes["property_originalfilename"].values[0].value,
              "type":type
          };
          return item;
      }
  }
}
customElements.define(RockEntityThumbnail.is, RockEntityThumbnail)
