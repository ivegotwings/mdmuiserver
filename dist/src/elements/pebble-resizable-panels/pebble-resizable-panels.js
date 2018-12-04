import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../bedrock-externalref-resizablepanels/bedrock-externalref-resizablepanels.js';
class PebbleResizablePanels extends PolymerElement {
  static get template() {
    return Polymer.html`
        <style>
            :host{
                display: block;
                height:100%;                
            }
            #splitscreenContainer,
            #resizable_panels {
                height: 100%;
                width: 100%;
            }

            #resizable_panels {
                --resizable-panels-knob-size: 4px;
                --resizable-panels-knob-color: #e3e3e3;
            }

            .panel {
                height: 100%;
                width:100%;
            }            
        </style>
        <div id="splitscreenContainer">
            <!-- resizable-panels adding via script (connectedCallback) -->
        </div>
        <slot id="slot"></slot>
`;
  }

  static get is() {
      return 'pebble-resizable-panels';
  }
  constructor() {
      super();
  }
  static get properties() {
      return {
          //Need to implement vertical resizable panels
          // vertical:{
          //     type:Boolean,
          //     value:false,
          //     notify:true,
          //     reflectToAttribute:true
          // }
      }
  }

  connectedCallback() {
      super.connectedCallback();

      let resizablePanelsContainer = this.shadowRoot.querySelector("#splitscreenContainer");
      if (resizablePanelsContainer) {
          let resizablePanels = document.createElement('resizable-panels');
          resizablePanels.id = "resizable_panels";
          let distributedNodes = this.childNodes//this.$.slot.assignedNodes({flatten: true});
          if (distributedNodes && distributedNodes.length > 0) {
              let slotCounter = 0;
              let slotContainer, slotElement;
              distributedNodes.forEach(element => {
                  if (element && (element.nodeName == "DIV")) {
                      slotCounter++;
                      element.setAttribute("slot", "panel_" + slotCounter);
                      slotContainer = document.createElement('div');
                      slotContainer.className = "panel ";
                      let panelWidth = element.getAttribute("panel-width");
                      if (panelWidth) {
                          slotContainer.style.width = panelWidth;
                      }
                      slotElement = document.createElement('slot');
                      slotElement.name = "panel_" + slotCounter;
                      slotContainer.appendChild(slotElement);
                      resizablePanels.appendChild(slotContainer);
                  }
              });
          }
          resizablePanelsContainer.appendChild(resizablePanels)
      }
  }
}
customElements.define(PebbleResizablePanels.is, PebbleResizablePanels);
