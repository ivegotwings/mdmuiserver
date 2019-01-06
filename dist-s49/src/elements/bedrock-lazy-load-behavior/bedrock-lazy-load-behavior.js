import '@polymer/polymer/polymer-legacy.js';
/***
     `bedrock-lazy-load-behavior` Represents a behavior which tells if the corresponding element is in view or not.
     Usage: If lazyLoad is set as true, the element will check for the element's position and if the element comes into view it will make the property active as true and also call the callback function if any.
     So the element can either observe the property 'active' and do their functionality accordingly or the element can set a callback function

     @group bedrock Elements
     @element bedrock-lazy-load-behavior
     @demo demo/index.html

     */
//required for gulp script parsing
//files with window.RUFBehaviors in them are not delayed for loading
window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.LazyLoadBehavior */
RUFBehaviors.LazyLoadBehavior = {
    properties: {
        /**
         *  A callback function which can be passed to the element. It will be called when the element comes into view.
         */
        callback: {
            type: Object
        },
        /**
         *  Flag which Specifies whether or not the component is in view
         */
        active: {
            type: Boolean,
            value: false,
            notify: true
        },
        /**
         *  Flag which specifies whether to check the position of the element or not
         */
        lazyLoad: {
            type: Boolean,
            value: false
        },
        id: {
            type: String,
            observer: "_idChanged"
        }
    },
    attached: function () {
        if (this.lazyLoad) {
            if (this.active) {
                let detail = {
                    "target": this
                };
                this.callback(detail);
            } else {
                this._initLazyLoad();
            }
        }
    },
    /*           This function has specifically been build for iron-list.
                 In iron-list, if we scroll fast instead of creating new row , some times it just convert the current row into the respective row.
                 So,if we give id based on index and check for id change, we can take care of such cases
      */
    _idChanged: function (newId, oldId) {
        if (this.lazyLoad && oldId != undefined) {
            if (this.active) {
                let detail = {
                    "target": this
                };
                this.callback(detail);
            } else {
                this._initLazyLoad();
            }
        }
    },

    _initLazyLoad: function () {
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
            if (!this.positionTrackerIntersectionObserver) {
                this.positionTrackerIntersectionObserver = new IntersectionObserver(function (entries, observer) {
                    for (let i = 0; i < entries.length; i++) {
                        entries[i].target._lazyLoadCallback(entries[i]);
                    }
                }, {});
            }
            if (this.active) {
                let detail = {
                    "target": this
                };
                this.callback(detail);
            } else {
                this.positionTrackerIntersectionObserver.observe(this);
            }
        }
    },

    _lazyLoadCallback(e) {
        if (e.isIntersecting || e.intersectionRatio > 0) {
            this.active = true;
            this.positionTrackerIntersectionObserver.unobserve(this);
            if (this.callback) {
                let detail = {
                    "target": this
                };
                this.callback(detail);
            }
        }
    }
};
