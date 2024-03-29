import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '../pebble-external-html/pebble-external-html.js';
import '../pebble-button/pebble-button.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-app-behavior/bedrock-app-behavior.js';
import '../bedrock-logger-behavior/bedrock-logger-behavior.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { Templatizer } from '@polymer/polymer/lib/legacy/templatizer-behavior.js';
class PebbleTemplatizer extends mixinBehaviors([
    Templatizer, 
    RUFBehaviors.AppBehavior,
    RUFBehaviors.LoggerBehavior
    ], PolymerElement) {
    static get is() {
				return "pebble-templatizer";
    }

    static get properties() {
				return {
            dataModel: {
                type: Object,
                value: function () {
                    return {};
                }
            },

            showeditor: {
                type: Boolean,
                value: false
            },

            view: {
                type: String,
                value: ''
            }
				};
    }

    constructor() {
				super();
    }

    connectedCallback() {
				super.connectedCallback();

				this.firstLoad = true;
    }

    disconnectedCallback() {
				super.disconnectedCallback();
    }

    embbedLoops() {
				if (this.html.indexOf('loop') !== -1) {
            this.html = this.html
                .replace(/<\bloop\b/g, '<template is="dom-repeat"')
                .replace(/<\/\bloop\b>/g, '</template>');
				}
    }

    embbedfonts() {
				this.fonts = this.view.substring(this.view.indexOf('<font>') + 6, this.view.indexOf(
            '</font>'));
				this.fonts.split(';').forEach(url => {
            let link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url.replace(/\s/g, '');
            document.head.appendChild(link);
				})
    }

    embbedRichText() {
				let richtexts = dom(this.root).querySelectorAll('.richtext');
				if (richtexts) {
            richtexts.forEach((richtext) => {
                let content = richtext.getAttribute('data-content');
                richtext.innerHTML = content;
            })
				}
    }

    parseViewModel() {
				let view = this.view;
				this.html =
            this.view.substring(view.indexOf('<html>') + 6, view.indexOf(
                '</html>'));

				this.externStyle = view.substring(view.indexOf('<style>') + 7, view.indexOf(
            '</style>'));
    }

    evalJS() {
				try {
            eval.call(window, this.externjs);
				} catch (e) {
            clearTimeout(this.errortimeout);
            this.errortimeout = setInterval(() => {
                if (this.inview) {
                    //rebind hack;
                    this._showEditor();
                    this.showeditor = false;
                    this._viewHtml();
                    eval.call(window, this.externjs);
                }
            }, 10);
            setTimeout(() => {
                clearTimeout(this.errortimeout);
            }, 1000);
            this.logError('Error',e.detail);
				}
    }

    parseJS() {
				let view = this.view;
				this.externjs = view.substring(view.indexOf('<jscript>') + 9, view.indexOf(
            '</jscript>'));
				let regex = /(document.querySelector\()/gm;
				this.externjs = this.externjs.replace(regex, "Polymer.dom(RUFUtilities.templateRoot).querySelector(");
				regex = /(document.querySelectorAll\()/gm;
				this.externjs = this.externjs.replace(regex, "Polymer.dom(RUFUtilities.templateRoot).querySelectorAll(");
				regex = /(document.getElementsByClassName\(("|'))/gm;
				this.externjs = this.externjs.replace(regex, 'Polymer.dom(RUFUtilities.templateRoot).querySelectorAll($2.');
				regex = /(document.getElementById\((("|')?))/gm;
				this.externjs = this.externjs.replace(regex, function (g1, g2, g3) {
            let prefix = '#';
            if (g3 === "") {
                prefix = 'Polymer.dom(RUFUtilities.templateRoot).querySelector("#" +';
            } else {
                prefix = 'Polymer.dom(RUFUtilities.templateRoot).querySelector(' + g3 + "#";
            }
            return prefix
				});
				regex = /(document.getElementsByTagName\()/gm;
				this.externjs = this.externjs.replace(regex,
            'Polymer.dom(RUFUtilities.templateRoot).querySelectorAll(');
				regex =
            /((\$|jQuery)[a-zA-Z0-9!@#$%^&*(_+\-=\[\]{};':"\\|,.<>\/?]*)/gm;
				this.externjs = this.externjs.replace(regex,
            "$1,RUFUtilities.templateRoot");
    }

    fetchImages() {
				this.images = dom(this.root).querySelectorAll('img');
				this.images.forEach(image => {
            let imageid = image.getAttribute('data-imageid');
            if (imageid) {
                this._getImageDownloadUrl(imageid);
            }
				})
    }

    _processTemplate() {
				this.parseViewModel();
				this.embbedLoops();
				this.embbedfonts();
				this._compileTemplate();
				this.embbedRichText();
				this.fetchImages();
				this.parseJS();
				//backup execute in interval so as to ensure bindings
				let timeout = setInterval(() => {
            this.evalJS();
				}, 10);
				setTimeout(() => {
            clearTimeout(timeout);
				}, 500);
    }

    _templateStamped() {
				if (this.firstLoad) {
            // this is a hack.....rebind js to doc
            this._showEditor();
            this.showeditor = false;
            setTimeout(() => {
                this._viewHtml();
            }, 100);
				}
				this.firstLoad = false;
    }

    _compileTemplate() {
				this.template =
            `
                    <dom-bind>
                        <template is="dom-bind" id="templateroot">
                            ${this.html}
                            <style>
                                ${this.externStyle}
                            </style>
                        </template>
                    </dom-bind>                    
                `
    }

    _editHtml() {
				this.firstLoad = true;
				this.inview = false;
				clearTimeout(this.errortimeout);
				this._showEditor();
    }

    _saveHtml() {
				this.view = dom(this.root).querySelectorAll('textarea')[0].value;
				let eventData = {
            name: "savepreviewclicked",
            data: this.view
				};
				this.dispatchEvent(new CustomEvent('bedrock-event', {
            detail: eventData,
            bubbles: true,
            composed: true
				}));
    }

    _viewHtml() {
				this.showeditor = false;
				this.inview = true;
				this.template = "";
				if (this.view === this.currentview) {
            this._processTemplate();
				} else {
            this.currentview = this.view;
            this._viewDataReceived();
				}
    }

    _showEditor() {
				this.showeditor = true;
				timeOut.after(100).run(() => {
            if (dom(this.root).querySelectorAll('textarea')[0]) {
                dom(this.root).querySelectorAll('textarea')[0].value = this.view;
            }
				});
				let range = document.createRange();
				let endNode = dom(this.root).querySelectorAll('placeholder')[0];
				let startNode = dom(this.root).querySelectorAll('pebble-external-html')[0];
				range.setStart(startNode, 0);
				range.setEnd(endNode, 0);
				this.embeddedDocumentFragment = range.extractContents();
				for (let i = 0; i < this.embeddedDocumentFragment.children.length; i++) {
            this.embeddedDocumentFragment.children.item(i).setAttribute('hidden', true);
				}
    }

    _getImageDownloadUrl(fileName) {
				if (fileName) {
            let req = {
                "binaryStreamObject": {
                    "id": fileName,
                    "type": "binarystreamobject",
                    "data": {}
                }
            };
            let downloadUrlLiquid = this._createLiquidRest("/data/binarystreamobjectservice/prepareDownload", this._onGetDownloadUrlResponse);

            if (downloadUrlLiquid) {
                downloadUrlLiquid.requestData = [req];
                downloadUrlLiquid.generateRequest();
            }
				}
    }

    _createLiquidRest(url, responseEvent) {
				let liquidElement = document.createElement("liquid-rest");
				liquidElement.url = url;
				liquidElement.method = "POST";
				DataHelper.oneTimeEvent(liquidElement, 'liquid-response', responseEvent.bind(this));
				return liquidElement;
    }

    _viewDataReceived() {
				let view = this.view;
				this.currentview = this.view;
				if (view) {
            this.externScripts = view.substring(view.indexOf('<external>') + 10, view.indexOf(
                '</external>'));
            this.externScripts = this.externScripts.trim().split(',');
            for (const [index, src] of this.externScripts.entries()) {
                const s = document.createElement('script');
                s.setAttribute('src', src);
                s.setAttribute('type', 'text/javascript');
                dom(this.root).appendChild(s);
            }

            let regex = /({{model.)(\w+).(\w+)}}/g;
            let attributes = [];
            let relationships = [];
            let relationshipAttributes = [];
            let m = regex.exec(view);
            while (m) {
                if (m) {
                    m[0] = m[0].substr(m[0].indexOf('{{') + 2, m[0].indexOf("}}") - 2);
                    let elems = m[0].split('.');
                    if (elems.length >= 2) {
                        //attribute
                        if (elems.length !== 2 && !isNaN(elems[1][elems[1].length - 1])) {
                            if (attributes.indexOf(elems[1].substring(0, elems[1].length - 1)) === -1) {
                                attributes.push(elems[1].substring(0, elems[1].length - 1))
                            }
                        } else {
                            if (attributes.indexOf(elems[1]) === -1) {
                                attributes.push(elems[1]);
                            }
                        }
                    }
                    if (elems.length >= 3) {
                        //relationship
                        if (!isNaN(elems[1][elems[1].length - 1])) {
                            if (relationships.indexOf(elems[1].substring(0, elems[1].length - 1)) === -1) {
                                relationships.push(elems[1].substring(0, elems[1].length - 1));
                            }
                        } else {
                            if (relationships.indexOf(elems[1]) === -1) {
                                relationships.push(elems[1]);
                            }
                        }
                        if (elems.length === 3 && elems[2].indexOf('prop') === -1) {
                            //relationship attribute
                            if (relationshipAttributes.indexOf(elems[2]) === -1) {
                                relationshipAttributes.push(elems[2]);
                            }
                        } else if (elems.length > 3 && elems[3].indexOf('prop') === -1) {
                            //relationship attribute
                            if (relationshipAttributes.indexOf(elems[3]) === -1) {
                                relationshipAttributes.push(elems[3]);
                            }
                        }
                    }
                }
                m = regex.exec(view);
            }
            let eventData = {
                name: "entitydatakeys",
                data: {
                    attributes: attributes,
                    relationships: relationships,
                    relationshipAttributes: relationshipAttributes
                }
            };
            this.dispatchEvent(new CustomEvent('bedrock-event', {
                detail: eventData,
                bubbles: true,
                composed: true
            }));
				}
    }

    _modelDataReceived() {
				this._processTemplate();
				let eventData = {
            name: "initializeshell",
				};
				this.dispatchEvent(new CustomEvent('bedrock-event', {
            detail: eventData,
            bubbles: true,
            composed: true
				}));
    }

    _onGetDownloadUrlResponse(e) {
				LiquidResponseHelper.downloadURLResponseMapper(e, (downloadURL, objectKey) => {
            this.images.forEach(img => {
                let imageid = img.getAttribute('data-imageid');
                if (imageid && imageid === objectKey) {
                    img.src = downloadURL;
                }
            })
				});
    }
}

customElements.define(PebbleTemplatizer.is, PebbleTemplatizer);
