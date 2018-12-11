/**
`pebble-position-tracker` Represents an element that displays an image.


@group pebble Elements
@element pebble-position-tracker
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '../bedrock-ui-behavior/bedrock-ui-behavior.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
class PebblePositionTracker extends mixinBehaviors([RUFBehaviors.UIBehavior], PolymerElement) {
    static get is() {
        return "pebble-position-tracker";
    }

    static get properties() {
        return {
            target: {
                type: String,
                observer: "_targetChanged"
            },
            
            callback: {
                type: Object
            }
        };
    }

    _targetChanged() {
        if (this.target) {
            this._initLazyLoad();
        }
    }

    _initLazyLoad() {
        let _this = this;
        if (!('IntersectionObserver' in window)) {
            let script = document.getElementById('polyfill-IntersectionObserver');
            if (!script) {
                script = document.createElement('script');
                script.id = 'polyfill-IntersectionObserver';
                script.async = true;
                script.src = '/src/scripts/intersection-observer.js';
                script.onload = onload;
                document.head.appendChild(script);
            }
            script.addEventListener("load", function () {
                _this._initLazyLoad(true);
            });
        } else {
            if (!this.targetIntersectionObserver) {
                this.targetIntersectionObserver = new IntersectionObserver(function (entries, observer) {
                    for (let i = 0; i < entries.length; i++) {
                        _this._lazyLoadCallback(entries[i]);
                    }
                }, {});
            }
            // observe target element
            this.async(function () {
                let elem = this.parentElement;
                let targetElement = dom(elem).querySelector("#" + this.target);
                if (targetElement) {
                    this.targetIntersectionObserver.observe(targetElement);
                }
            });
        }
    }

    _lazyLoadCallback(e) {
        if (e.isIntersecting || e.intersectionRatio > 0) {
            let detail = { "target": e.target };
            this.targetIntersectionObserver.unobserve(e.target);
            if (this.callback) {
                this.callback(detail);
            } else {
                this.fireBedrockEvent("element-in-view", { target: e.target }, { "ignoreId": true });
            }
        }
    }
}
customElements.define(PebblePositionTracker.is, PebblePositionTracker);
