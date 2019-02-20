/*
`element-helper` Represents a bunch of helpers to work with html elements that any bedrock, pebble, rock or app can use.
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { dom as dom$0 } from '@polymer/polymer/lib/legacy/polymer.dom.js';
window.ElementHelper = window.ElementHelper || {};

ElementHelper.cloneObject = function (o) {
    return DataHelper.cloneObject(o);
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

let ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

let UNIQUE_RETRIES = 9999;

let ids = [];

let generate = function(ID_LENGTH){
    let rtn = '';
    for (let i = 0; i < ID_LENGTH; i++) {
        rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    rtn = 'rs' + rtn;
    return rtn;
}

let generateUnique = function(length) {
    
    
    return generate(length);

    // TODO: not maintaining unique id list as of now. should we do? why?

    // let id;
    // ids = ids || [];
    // let retries = 0;
    // while(!id && retries < UNIQUE_RETRIES) {
    //     id = generate(length);
    //     if(ids.indexOf(id) !== -1) {
    //         id = null;
    //         retries++;
    //     }
    // }

    //ids.push(id);
    //return id;
};

ElementHelper.getRandomId = function () {
    return generateUnique(16);
};

ElementHelper.getRandomString = function () {
    return generateUnique(12);
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