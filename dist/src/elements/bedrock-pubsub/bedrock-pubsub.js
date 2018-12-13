import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../bedrock-helpers/data-helper.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
/**
`bedrock-pubsub` provides the basic publish-subscribe functionality for the events.

### Example
        
You can fire a custom event of type `bedrock-event`, with a detail object containing `name` and `data` 
fields to send a signal as shown in the below code:
        
`this.dispatchEvent(new CustomEvent('bedrock-event', {name: 'hello', data: null});`
        
You can listen for `bedrock-event-<name>` event on a `bedrock-pubsub` element to receive a signal as shown
in the below code:
        
`<bedrock-pubsub on-bedrock-event-hello="{{helloSignal}}">`
        
You can fire a signal event from anywhere and all `bedrock-pubsub` elements receive the event regardless
of where they are in DOM.
        
@demo demo/index.html
*/

window.globalPubSubInstances = window.globalPubSubInstances || {};

class BedrockPubsub extends PolymerElement {
    static get is() { return 'bedrock-pubsub' }

    static get properties() {
        return {

            /**
            * Indicates an identifier for the App. There is no need to pass this value when you use it.
            */
            appId: {
                type: String,
                value: ""
            },
            /**
            * Indicates the event name that needs subscription.
            */
            eventName: {
                type: String
            },
            /**
            * Indicates an event handler name.
            */
            handler: {
                type: String
            },
            /**
            * Indicates the identifier of the target element that pulishes the event.
            */
            targetId: {
                type: String,
                value: ""
            },

            name: {
                type: String,
                value: ""
            }
        }
    }
    /**
      * Content is not appearing - Content development is under progress. 
      */
    
    ready() {
        super.ready();
       
        //pubsub instance storage
        if (!RUFUtilities.pubsubListenerRegistry) {
            RUFUtilities.pubsubListenerRegistry = { 'universal': [] };
            RUFUtilities.pubsubEventNameRegistry = { 'universal': [] };

            document.addEventListener('bedrock-event', this._onBedrockEvent.bind(this));
        }

        let activeApp = ComponentHelper.getCurrentActiveApp();
        if (activeApp) {
            this.appId = activeApp.id;
        }
        microTask.run(() => {
            this._registerEvent();
            if (this.name) {
                if (!globalPubSubInstances[this.name]) {
                    globalPubSubInstances[this.name] = [];
                }
                globalPubSubInstances[this.name].push(this);
            }
        });
    }
    /**
      * Content is not appearing - Content development is under progress. 
      */
    disconnectedCallback() {
        super.disconnectedCallback();
        this._cleanGlobalPubSubInstances();
    }
    connectedCallback() {
        super.connectedCallback();
        
    }

    // event dispatcher
    _publish(name, data) {
        let rufEevent = new CustomEvent('bedrock-event-' + name, {
            bubbles: false,
            detail: data
        });
        let instance = globalPubSubInstances['bedrock-event-' + name];
        if (instance && instance.length > 0) {
            instance.forEach((i) => i.dispatchEvent(rufEevent));
        }
    }

    _onBedrockEvent(e) {
        this._publish(e.detail.name, e.detail.data);
    }

    _getPubSubContainer(element) {
        let parentNode = element.parentNode;
        if (parentNode) {
            if (parentNode.isRufComponent) {
                return parentNode;
            }
            else if (parentNode.host && parentNode.host.isRufComponent) {
                return parentNode.host;
            }
            else {
                return this._getPubSubContainer(dom(parentNode));
            }
        }
        return parentNode;
    }
    _registerEvent() {
        let pubSubContainer = this._getPubSubContainer(dom(this).node);
        let pubsubContent = {}
        if (pubSubContainer && this.eventName) {
            let eventAttr = "bedrock-event-" + this.eventName;
            if (this.targetId) {
                eventAttr = eventAttr + "-" + this.targetId;
            }

            if (pubSubContainer.localName == "main-app" || ((pubSubContainer.className.indexOf('view-component') > -1) && pubSubContainer.contentViewManager && pubSubContainer.id)) {
                eventAttr = eventAttr + "-" + pubSubContainer.id;
            }
            else {
                let appId = pubSubContainer.getAppId();
                if (appId && appId != "") {
                    eventAttr = eventAttr + "-" + appId;
                }
            }

            pubsubContent.element = pubSubContainer
            pubsubContent.eventName = eventAttr;
            pubSubContainer.listen(pubSubContainer, eventAttr, this.handler);
            if (this.appId) {
                RUFUtilities.pubsubEventNameRegistry[this.appId] = RUFUtilities.pubsubEventNameRegistry[this.appId] || [];
                RUFUtilities.pubsubListenerRegistry[this.appId] = RUFUtilities.pubsubListenerRegistry[this.appId] || [];
                let index = RUFUtilities.pubsubEventNameRegistry[this.appId].indexOf(this.eventName);
                if (index === -1) {
                    RUFUtilities.pubsubEventNameRegistry[this.appId].push(this.eventName);
                    RUFUtilities.pubsubListenerRegistry[this.appId].push([pubsubContent]);
                } else if(!_.isEmpty(RUFUtilities.pubsubListenerRegistry[this.appId][index].find(elm => elm.eventName === pubsubContent.eventName))) {
                    RUFUtilities.pubsubListenerRegistry[this.appId][index].push(pubsubContent);
                }
            } else {
                let index = RUFUtilities.pubsubEventNameRegistry['universal'].indexOf(this.eventName);
                if (index === -1) {
                    RUFUtilities.pubsubListenerRegistry['universal'].push([pubsubContent]);
                    RUFUtilities.pubsubEventNameRegistry['universal'].push(this.eventName);
                } else if(_.isEmpty(RUFUtilities.pubsubListenerRegistry['universal'][index].find(elm => elm.eventName === pubsubContent.eventName))) {
                    RUFUtilities.pubsubListenerRegistry['universal'][index].push(pubsubContent);
                }
            }

            if (!this.name) {
                ComponentHelper.addToDeleteQueue(this);
            }
        } else {
            //What to do ??
            //ComponentHelper.addToDeleteQueue(this);
        }
    }
    /**
      * Content development is under progress. 
      */
    registerEvent() {
        this._registerEvent();
    }

    removeEvent(){
        if(this.appId && (this.appId != "main-app")){
            const registryEvent = RUFUtilities.pubsubEventNameRegistry[this.appId];
            let eventIndex = registryEvent && registryEvent.indexOf(this.eventName);
            if (eventIndex !== -1 && RUFUtilities.pubsubListenerRegistry[this.appId]) {
                RUFUtilities.pubsubEventNameRegistry[this.appId].splice(eventIndex, 1);
                RUFUtilities.pubsubListenerRegistry[this.appId].splice(eventIndex, 1);
            }
        }
    }

    _cleanGlobalPubSubInstances() {
        if (this.name) {
            let instances = globalPubSubInstances[this.name];
            if (instances) {
                let index = instances.indexOf(this);

                if (index > -1) {
                    instances.splice(index, 1);
                }
            }
        }
    }
}

customElements.define(BedrockPubsub.is, BedrockPubsub)
