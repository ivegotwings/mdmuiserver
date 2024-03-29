import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-toast-behavior/bedrock-toast-behavior.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../pebble-spinner/pebble-spinner.js';
import '../pebble-templatizer/pebble-templatizer.js';
import '../liquid-entity-model-composite-get/liquid-entity-model-composite-get.js';
import '../liquid-entity-data-get/liquid-entity-data-get.js';
import '../liquid-config-get/liquid-config-get.js';
import '../liquid-config-save/liquid-config-save.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class RockEntityPreview
    extends mixinBehaviors([
        RUFBehaviors.AppBehavior, RUFBehaviors.LoggerBehavior, RUFBehaviors.ToastBehavior
    ], OptionalMutableData(PolymerElement)) {
  static get template() {
    return html`
        <style>
            :host {
                @apply --app-entity-preview-content-height;
                overflow: auto;
                display: block;
            }
        </style>
        <pebble-templatizer data-model="[[dataModel]]" view="{{view}}"></pebble-templatizer>
        <pebble-spinner active="[[_loading]]"></pebble-spinner>
        <liquid-entity-model-composite-get id="compositeAllModelGet" on-entity-model-composite-get-response="_onCompositeAllModelGetResponse" on-error="_onCompositeAllModelGetError"></liquid-entity-model-composite-get>
        <liquid-entity-data-get id="entityGetDataService" operation="getbyids" use-data-coalesce="" apply-locale-coalesce="true" on-response="_onEntityDataGetReceived" on-error="_onEntityDataGetFailed" data-index="entityData" data-sub-index="data"></liquid-entity-data-get>
        <liquid-config-get id="templateDataGet" operation="getbyids" request-id="req1" request-data="{{request}}" on-response="_onConfigsGetResponse"></liquid-config-get>
        <liquid-config-save id="templateDataSave" verbose="" name="configSaveService" on-response="_onSaveResponse" data-index="config" data-sub-index="config"></liquid-config-save>
        <bedrock-pubsub on-bedrock-event-savepreviewclicked="_saveTemplate" name="bedrock-event-savepreviewclicked"></bedrock-pubsub>
        <bedrock-pubsub on-bedrock-event-entitydatakeys="_entityDataKeysReceived" name="bedrock-event-entitydatakeys"></bedrock-pubsub>
`;
  }

  static get is() {
      return 'rock-entity-preview';
  }
  static get observers() {
      return [
          'onDataReceived(contextData, entityType, entityId)'
      ]
  }
  static get properties() {
      return {
          contextData: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          entityType: {
              type: String,
              value: ''
          },
          entityId: {
              type: String,
              value: ''
          },
          templateId: {
              type: String,
              value: ''
          },
          dataModel: {
              type: Object,
              value: function () {
                  return {};
              }
          },
          _loading: {
              type: Boolean,
              value: true
          },
          view: {
              type: String,
              value: ''
          }
      }
  }

  onDataReceived (contextData, entityType, entityId) {
      if (contextData && entityType && entityId) {
          this.compositeModelGet();
      }
  }

  compositeModelGet () {
      let clonedContextData = DataHelper.cloneObject(this.contextData);
      let compositeModelAllGetRequest = DataRequestHelper.createEntityModelCompositeGetRequest(
          clonedContextData);
      compositeModelAllGetRequest.params.fields.relationships = ["_ALL"];
      compositeModelAllGetRequest.params.fields.attributes = ["_ALL"];
      if (compositeModelAllGetRequest && this.compositeAllModelGetLiq) {
          this.compositeAllModelGetLiq.requestData = compositeModelAllGetRequest;
          this.compositeAllModelGetLiq.generateRequest();
      }
  }

  _onCompositeAllModelGetResponse (e, detail) {
      this.entityModel = detail.response;
      this._fetchEntityTemplate();
  }

  _fetchEntityTemplate () {
      this.request = {
          "params": {
              "query": {
                  "id": this.templateId,
                  "filters": {
                      "typesCriterion": ["entityPreviewTemplate"]
                  }
              },
              "fields": {
                  "jsonData": true
              }
          }
      };
      this.shadowRoot.querySelector('#templateDataGet').generateRequest();
  }

  _fetchEntityData () {
      let clonedContextData = DataHelper.cloneObject(this.contextData);
      clonedContextData.ItemContexts = [];
      clonedContextData.ItemContexts.push({
          properties: ['_ALL'],
          attributeNames: this.attribute,
          relationships: this.relationship,
          relationshipAttributes: this.relationshipAttribute,
          relatedEntityAttributes: ["property_objectkey"],
          type: this.entityType,
          id: this.entityId
      });

      let req = DataRequestHelper.createEntityGetRequest(clonedContextData, true);
      let liquidDataGet = this.entityDataGetServiceLiq;
      liquidDataGet.requestData = req;
      liquidDataGet.generateRequest();

  }

  _onCompositeAllModelGetError (e, detail) {
      this.logError('Composite model get call failed', e.detail);
  }

  _onEntityDataGetReceived (e, detail) {
      let model = this._prepareModel(DataHelper.isValidObjectPath(detail,
              "response.content.entities.0.data") ? detail.response.content.entities[
              0].data : {},
          DataHelper.isValidObjectPath(detail,
              "response.content.entities.0.properties") ? detail.response.content.entities[
              0].properties : {}
      );

      this.dataModel = model;
      this._loading = false;
      let eventData = {
          name: "datamodelready",
      };
      this.dispatchEvent(new CustomEvent('bedrock-event', {
          detail: eventData,
          bubbles: true,
          composed: true
      }));

      eventData = {
          name: 'previewid',
          data: {
              entityname: model.name || this.entityId,
              templateid: this.templateId
          }
      }
      this.dispatchEvent(new CustomEvent('bedrock-event', {
          detail: eventData,
          bubbles: true,
          composed: true
      }));
  }

  _proccessAttributes (attributes, attributemodel) {
      let model = {};
      if (!attributes) {
          return model;
      }
      Object.keys(attributes).forEach(key => {
          if (attributes[key].values) {
              let collection = [];
              if (attributemodel[key] && attributemodel[key].properties &&
                  attributemodel[key].properties.isCollection) {
                  collection = attributes[key].values;
              } else {
                  //for coalesce
                  collection.push(attributes[key].values[0]);
              }
              model[key] = collection.map(val => {
                  if (attributemodel[key] && attributemodel[key].properties &&
                      attributemodel[key].properties
                      .dataType) {
                      const dataType = attributemodel[key].properties
                          .dataType;
                      if (dataType === "date" || dataType ===
                          'datetime') {
                          return FormatHelper.convertFromISODateTime(
                              val.value,
                              attributemodel[key].properties.dataType
                          )
                      } else {
                          return val.value;
                      }
                  }
                  return val.value;
              });
          }
          if (attributes[key].group) {
              model[key] = attributes[key].group.map(val => {
                  let returnVal = {};
                  Object.keys(val).forEach(nestedVal => {
                      if (Array.isArray(val[nestedVal].values)) {
                          returnVal[nestedVal] = val[
                                  nestedVal].values
                              .map(value => {
                                  return value.value;
                              });
                          if (returnVal[nestedVal].length >
                              1) {
                              for (const [index, element] of
                                  returnVal[
                                      nestedVal].entries()
                              ) {
                                  returnVal[nestedVal +
                                          index] =
                                      element;
                              }
                          } else {
                              returnVal[nestedVal] =
                                  returnVal[
                                      nestedVal][0];
                          }
                      }
                  });
                  return returnVal;
              });
          }
          model = this._generateArrayKeys(model, key);
      });
      return model;
  }

  _generateArrayKeys (model, key) {
      if (model[key].length > 1) {
          for (const [index, element] of model[key].entries()) {
              model[key + index] = element;
          }
      } else {
          model[key] = model[key][0];
      }
      return model;
  }

  _prepareModel (entityData, properties) {
      let model = {};
      let attributes = DataHelper.isValidObjectPath(entityData, "contexts.0.attributes") ?
          entityData.contexts[0].attributes : entityData.attributes;
      let attributemodel = this.entityModel.content.entityModels[0].data.attributes;
      if (attributemodel) {
          /**
           *Process Attributes
           **/
          model = this._proccessAttributes(attributes, attributemodel);
      }

      /**
       *Process Relations
       **/

      let relationships = DataHelper.isValidObjectPath(entityData,
          "contexts.0.relationships") ? entityData.contexts[
          0].relationships : entityData.relationships;
      if (relationships) {
          Object.keys(relationships).forEach(key => {
              model[key] = relationships[key].map(val => {
                  let returnVal = {};
                  if (val.relTo) {
                      Object.keys(val.relTo).forEach(prop => {
                          if (prop === 'data') {
                              returnVal = Object.assign(
                                  returnVal,
                                  this._proccessAttributes(
                                      val.relTo[prop]
                                      .attributes,
                                      attributemodel)
                              );
                          } else {
                              returnVal['prop_' + prop] =
                                  val.relTo[
                                      prop];
                          }
                      });
                  }

                  if (val.attributes) {
                      let relAttributeModel = this._proccessAttributes(
                          val.attributes,
                          attributemodel);
                      returnVal = Object.assign(returnVal,
                          relAttributeModel);
                  }
                  return returnVal;
              });

              model = this._generateArrayKeys(model, key);
          });

      }

      if (properties) {
          let propertyModel = this.entityModel.content.entityModels[0].data.properties;
          Object.keys(properties).forEach(key => {
              if (propertyModel && propertyModel[key]) {
                  // if (dataType === "date" || dataType ===
                  //     'datetime') {
                  //     model['prop_' + key] = FormatHelper.convertFromISODateTime(
                  //         properties[key],
                  //         propertyModel[key].properties.dataType
                  //     )
                  // }
              } else {
                  model['prop_' + key] = properties[key];
              }
          });
      }
      return model;
  }

  _entityDataKeysReceived (e) {
      this.attribute = e.detail.attributes;
      this.relationship = e.detail.relationships;
      this.relationshipAttribute = e.detail.relationshipAttributes;
      this._fetchEntityData();
  }

  _saveTemplate (e) {
      let view = e.detail;
      let base64 = btoa((view).replace(
          /[\u0250-\ue007]/g, ''));
      let requestData = {
          "configObjects": [{
              "id": this.templateId,
              "name": this.templateId,
              "type": "entityPreviewTemplate",
              "data": {
                  "jsonData": {
                      "blob": base64
                  }
              }
          }]
      }
      let configSaveService = this.shadowRoot.querySelector(
          '[name="configSaveService"]');
      if (configSaveService) {
          configSaveService.operation = "update";
          configSaveService.requestData = requestData;
          configSaveService.generateRequest();
      }
  }

  _onEntityDataGetFailed (e, detail) {
      this.logError('Entity data get failed', e.detail);
  }

  get compositeAllModelGetLiq() {
      this._compositeAllModelGet = this._compositeAllModelGet || this.shadowRoot.querySelector(
          "#compositeAllModelGet");
      return this._compositeAllModelGet;
  }

  get entityDataGetServiceLiq() {
      this._entityGetDataService = this._entityGetDataService || this.shadowRoot.querySelector(
          "#entityGetDataService");
      return this._entityGetDataService;
  }

  _onConfigsGetResponse (e) {
      if (DataHelper.isValidObjectPath(e.detail.response, 'content.configObjects') &&
          DataHelper.isValidObjectPath(e
              .detail.response.content.configObjects[0], 'data.jsonData.blob')) {
          this.view = atob(e.detail.response.content.configObjects[0].data.jsonData
              .blob);
          let eventData = {
              name: "viewdatareceived"
          };
          this.dispatchEvent(new CustomEvent('bedrock-event', {
              detail: eventData,
              bubbles: true,
              composed: true
          }));
      } else {
          this.logError(
              'Unable to download preview.',
              e.detail);
      }
  }

  _onSaveResponse (e) {
      if (e.detail.response.status === 'success') {
          this.showSuccessToast('Changes saved successfully', 1000);
      } else {
          this.logError(
              'Unable to save changes.',
              e.detail);
      }
  }
}
customElements.define(RockEntityPreview.is, RockEntityPreview);
