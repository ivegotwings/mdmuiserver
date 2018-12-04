/*
`element-helper` Represents a bunch of helpers to work with html elements that any bedrock, pebble, rock or app can use.
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { Settings } from '@polymer/polymer/lib/utils/settings.js';

import { dom as dom$0 } from '@polymer/polymer/lib/legacy/polymer.dom.js';
window.ElementHelper = window.ElementHelper || {};

ElementHelper.cloneObject = function (o) {
    return DataHelper.cloneObject(o);
};

ElementHelper.getShadowElement = function (customElement) {
    let rootElement;

    if (Settings.dom == "shadow") {
        rootElement = customElement.root;
    } else {
        rootElement = customElement;
    }

    return rootElement;
};

/**
 * Get the element from the current document
 */
ElementHelper.getElement = function (currentNode, selector) {
    if (selector && currentNode && currentNode.shadowRoot) {
        return currentNode.shadowRoot.querySelector(selector) ||
            dom$0(currentNode).node.querySelector(selector);
    }
};

let ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

let UNIQUE_RETRIES = 9999;

let ids = [];

let generate = function(ID_LENGTH){
    let rtn = '';
    for (let i = 0; i < ID_LENGTH; i++) {
        rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return rtn;
}

let generateUnique = function(length, previous) {
    previous = previous || [];
    let retries = 0;
    let id;

    // Try to generate a unique ID,
    // i.e. one that isn't in the previous.
    while(!id && retries < UNIQUE_RETRIES) {
        id = generate(length);
        if(previous.indexOf(id) !== -1) {
            id = null;
            retries++;
        }
    }

    return id;
};

ElementHelper.getRandomId = function () {
    return generateUnique(16, ids);
};

ElementHelper.getRandomString = function () {
    return generateUnique(12, ids);
};

ElementHelper.noBubble = function (e) {
    e = e || event;
    if (e) {
        e.returnValue = false;
        e.cancelBubble = true;
        e.stopPropagation();
        e.preventDefault();
    }
};

ElementHelper.getElementPath = function (e) {
    if(e) {
        let path = e.path || (e.composedPath && e.composedPath());
        if (path) {
            return path;
        }
        else {
            path = [];
            let node = e.target;
            while (node) {
                let pathNode = node;
                path.push(pathNode);
                node = node.parentNode;
            }
        }
        return path;
    }
};