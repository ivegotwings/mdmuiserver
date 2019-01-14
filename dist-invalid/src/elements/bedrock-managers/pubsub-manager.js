import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import '../bedrock-helpers/data-helper.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
window.globalPubSubInstances = window.globalPubSubInstances || {};

class PubSubManager extends mixinBehaviors([RUFBehaviors.LoggerBehavior], PolymerElement) {

    static get is() {
        return "pubsub-manager";
    }

    constructor() {
        super();
        if (!RUFUtilities.pubsubManager) {
            RUFUtilities.pubsubManager = this;
            document.addEventListener('bedrock-event', e => this._onBedrockEvent(e));
        }
    }

    static getInstance() {
        if (!RUFUtilities.pubsubManager) {
            RUFUtilities.pubsubManager = new PubSubManager();
            //pubsub instance storage
            if (!RUFUtilities.pubsubListenerRegistry) {
                RUFUtilities.pubsubListenerRegistry = { 'universal': [] };
                RUFUtilities.pubsubEventNameRegistry = { 'universal': [] };
            }
        }
        return RUFUtilities.pubsubManager;
    }

    unRegister(element) {
        //app registry
        if (element.appId && (element.appId != "main-app")) {
            let appId = element.appId;
            let eventName = element.eventName;
            const registryEvent = RUFUtilities.pubsubEventNameRegistry[appId];
            let eventIndex = registryEvent && registryEvent.indexOf(eventName);
            if (eventIndex !== -1 && RUFUtilities.pubsubListenerRegistry[appId]) {

                if (!_.isEmpty(RUFUtilities.pubsubListenerRegistry[appId][eventIndex])) {
                    let listeners = RUFUtilities.pubsubListenerRegistry[appId][eventIndex];
                    for (let listenerIndex = 0; listenerIndex < listeners.length; listenerIndex++) {
                        const listener = listeners[listenerIndex];
                        if (listener.eventId == element.eventId) {
                            listeners.splice(listenerIndex, 1);
                            break;
                        }
                    }
                    if (listeners.length == 0) {
                        RUFUtilities.pubsubEventNameRegistry[appId].splice(eventIndex, 1);
                        RUFUtilities.pubsubListenerRegistry[appId].splice(eventIndex, 1);
                    }
                }
            }
        }
        //Global registry
        if (element.name) {
            let instances = globalPubSubInstances[element.name];
            if (instances) {
                let index = instances.indexOf(element);

                if (index > -1) {
                    instances.splice(index, 1);
                }
            }
        }
    }
    
    register(element) {
        let activeApp = ComponentHelper.getCurrentActiveApp();
        if (activeApp) {
            element.appId = activeApp.id;
        }
        let pubSubContainer = this._getPubSubContainer(dom(element).node);
        let pubsubContent = {}
        if (pubSubContainer && element.eventName) {
            let eventName = element.eventName;
            let eventAttr = "bedrock-event-" + eventName;
            element.eventId = DataHelper.generateUUID();
            if (element.targetId) {
                eventAttr = eventAttr + "-" + element.targetId;
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
            pubsubContent.eventId = element.eventId;

            pubSubContainer.listen(pubSubContainer, eventAttr, element.handler);

            if (element.appId) {
                let appId = element.appId;
                RUFUtilities.pubsubEventNameRegistry[appId] = RUFUtilities.pubsubEventNameRegistry[appId] || [];
                RUFUtilities.pubsubListenerRegistry[appId] = RUFUtilities.pubsubListenerRegistry[appId] || [];
                let index = RUFUtilities.pubsubEventNameRegistry[appId].indexOf(eventName);
                if (index === -1) {
                    RUFUtilities.pubsubEventNameRegistry[appId].push(eventName);
                    RUFUtilities.pubsubListenerRegistry[appId].push([pubsubContent]);
                } else if (!_.isEmpty(RUFUtilities.pubsubListenerRegistry[appId][index].find(elm => elm.eventName === pubsubContent.eventName))) {
                    RUFUtilities.pubsubListenerRegistry[appId][index].push(pubsubContent);
                }
            } else {
                let index = RUFUtilities.pubsubEventNameRegistry['universal'].indexOf(eventName);
                if (index === -1) {
                    RUFUtilities.pubsubListenerRegistry['universal'].push([pubsubContent]);
                    RUFUtilities.pubsubEventNameRegistry['universal'].push(eventName);
                } else if (_.isEmpty(RUFUtilities.pubsubListenerRegistry['universal'][index].find(elm => elm.eventName === pubsubContent.eventName))) {
                    RUFUtilities.pubsubListenerRegistry['universal'][index].push(pubsubContent);
                }
            }
        } else {
            //What to do ??
            //ComponentHelper.addToDeleteQueue(this);
        }
        if (element.name) {
            let elementName = element.name;
            if (!globalPubSubInstances[elementName]) {
                globalPubSubInstances[elementName] = [];
            }
            globalPubSubInstances[elementName].push(element);
        }
    }
    
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
}

customElements.define(PubSubManager.is, PubSubManager);

export default PubSubManager;