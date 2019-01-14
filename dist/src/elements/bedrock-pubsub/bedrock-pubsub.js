import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../bedrock-helpers/data-helper.js';
import '../bedrock-managers/pubsub-manager.js';
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

class BedrockPubsub extends PolymerElement {
    static get is() {
        return 'bedrock-pubsub'
    }

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
            },

            eventId: {
                type: String,
                value: ""
            }
        }
    }
    /**
     * Content is not appearing - Content development is under progress. 
     */
    disconnectedCallback() {
        super.disconnectedCallback();
        let pubsubManager = PubSubManager.getInstance();
        if (pubsubManager) {
            pubsubManager.unRegister(this);
        }
    }
    connectedCallback() {
        super.connectedCallback();
        this.registerEvent();
    }

    registerEvent() {
        let pubsubManager = PubSubManager.getInstance();
        if (pubsubManager) {
            pubsubManager.register(this);
        }
    }
}

customElements.define(BedrockPubsub.is, BedrockPubsub)
