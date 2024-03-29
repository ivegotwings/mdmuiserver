import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-ajax/iron-request.js';
/***
* `RUFBehaviors.Internationalization` wraps the [format.js](http://formatjs.io/) library to
* help you internationalize your application. Note that if you are on a browser that
* does not natively support the [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
* object, you must load the polyfill yourself. An example polyfill can be found [here](https://github.com/andyearnshaw/Intl.js/).
*
* `RUFBehaviors.Internationalization` supports the same [message-syntax](http://formatjs.io/guides/message-syntax/)
* of format.js, in its entirety. Use the library docs as reference for the
* available message formats and options.
*
*  ### Example
*  Sample application loading resources:
*
*     <dom-module id="x-app">
*        <template>
*         <div>{{localize('hello', 'name', 'Batman')}}</div>
*        </template>
*        <script>
*           Polymer({
*             is: "x-app",
*
*             behaviors: [
*               RUFBehaviors.Internationalization
*             ],
*
*             properties: {
*               language: {
*                 value: 'en'
*               },
*             }
*             //explicitly loading resources from remote url if bedrock-init is not used
*             attached: function() {
*               this.loadResources(this.resolveUrl('locales.json'));
*             },
*           });
*        &lt;/script>
*     </dom-module>
*
* Alternatively, you can also inline your resources inside the app itself:
*
*     <dom-module id="x-app">
*        <template>
*         <div>{{localize('hello', 'name', 'Batman')}}</div>
*        </template>
*        <script>
*           Polymer({
*             is: "x-app",
*
*             behaviors: [
*               RUFBehaviors.Internationalization
*             ],
*
*             properties: {
*               language: {
*                 value: 'en'
*               },
*               //overriding resources if bedrock-init is not used
*               resources: {
*                 value: function() {
*                   return {
*                     'en': { 'hello': 'My name is {name}.' },
*                     'fr': { 'hello': 'Je m\'apelle {name}.' }
*                   }
*               }
*             }
*           });
*        &lt;/script>
*     </dom-module>
*
* @demo demo/index.html
* @polymerBehavior RUFBehaviors.Internationalization
*/

window.RUFBehaviors = window.RUFBehaviors || {};
/** @polymerBehavior RUFBehaviors.Internationalization */
RUFBehaviors.Internationalization = {

  /**
   * Internal singleton cache. This is the private implementation of the
   * behaviour; don't interact with it directly.
   */
  localizationCache: {
    requests: {},  /* One iron-request per unique resources path. */
    messages: {},  /* Unique localized strings. Invalidated when the language, formats or resources change. */
    ajax: null     /* Global iron-ajax object used to request resource files. */
  },

  /**
   * If the element is using `pathToResources` to load an external resources
   * file, fired when the file has been loaded.
   *
   * @event localize-resources-loaded
   */

  /**
   * If the element is using `pathToResources` to load an external resources
   * file, fired when the file cannot be loaded due to an error.
   *
   * @event localize-resources-error
   */

  properties: {
    /**
     * Content is not appearing - Indicates the language used for the translation.
     */
    language: {
      type: String,
      value: function () {
        return "";
      }
    },
    /**
     * Content is not appearing - Indicates an optional dictionary of user defined formats. See
     * http://formatjs.io/guides/message-syntax/#custom-formats for more information on the optional 
     * dictionary.
     *
     * For example, a valid dictionary is:
     * this.formats = {
     *    number: { USD: { style: 'currency', currency: 'USD' } }
     * }
     */
    formats: {
      type: Object,
      value: function () { return {} }
    },

    /**
    * Content is not appearing - Indicates the key for the translation. If it is set to <b>true</b>, then it uses the provided key when
    * the translation does not exist for that key.
    */
    useKeyIfMissing: {
      type: Boolean,
      value: false
    },

    /**
     * Content is not appearing - Indicates the translated string to the current `language`. The parameters to the
     * string must be passed in the following order:
     * `localize(stringKey, param1Name, param1Value, param2Name, param2Value)`
     */
    /**
      * Content is not appearing - Content development is under progress. 
      */

    pathToResources: {
      type: String
    },

    /**
     * Content is not appearing - Indicates the overriden resources that are specific to  the `rock element` or page.
     */
    overridenResources: {
      type: Object
    }

  },

  created() {
    this.onRequestResponse = this.onRequestResponse.bind(this);
    this.onRequestError = this.onRequestError.bind(this);
  },
   /**
     * Content is not appearing - Content development is under progress. 
     */
  ready: function () {
    if (this.nodeName == 'BEDROCK-INIT') {
      this.addEventListener('localize-resources-loaded', function () {
        RUFUtilities.localizationResourcesLoaded = true;
      });
    }
  },

  detached() {
    window.removeEventListener('resources-loaded', this.onResourceLoaded);
    
    if(!this.ajax) return;
    
    this.ajax.removeEventListener('response', this.onRequestResponse);
    this.ajax.removeEventListener('error', this.onRequestError);
  },

  /**
  * Content is not appearing - Can be used to initialize the internationalization resources.
  *
  * @method init
  * @param {(String)} resourcePath The remote path for resource
  * @param {(String)} localeLanguage The locale language for resource
  */
  init: function (resourcePath, localeLanguage) {

    this.language = localeLanguage || RUFUtilities.localeLanguage;
    if (localeLanguage != undefined && localeLanguage != '') {
      RUFUtilities.localeLanguage = localeLanguage;
    }
    if (resourcePath != undefined) {
      if (this.nodeName == 'BEDROCK-INIT') {
        this.loadResources(resourcePath);
      }
    }
  },

  localize: function(){
    let proto = this.constructor.prototype;
    if(!proto.__localize) {
      return this.computeLocalize();
    }
    return proto.__localize;
  },
  /**
    * Content is not appearing - Content development is under progress. 
    */
  loadResources: function (path) {
    let proto = this.constructor.prototype;

    // If the global ajax object has not been initialized, initialize and cache it.
    let ajax = undefined; //proto.localizationCache.ajax;
    if (!ajax) {
      //ToDo: Use liquid element for localization config
      ajax = proto.localizationCache.ajax = document.createElement('iron-ajax');
    }

    this.ajax = ajax;

    ajax.addEventListener('response',this.onRequestResponse);
    ajax.addEventListener('error',this.onRequestError);
    
    let request = proto.localizationCache.requests[path];
    if (!request) {
      ajax.url = path;
      //ajax.sync = true;
      request = ajax.generateRequest();
      proto.localizationCache.requests[path] = request;
    }
  },
  /**
  * Content is not appearing - Can be used to switch the language for resources.
  *
  * @method switchLangauge
  * @param {(String)} newDefaultLangauge The new language for resources
  */
  switchLangauge: function (newDefaultLangauge) {
    if (newDefaultLangauge != undefined) {
      this.language = newDefaultLangauge;
    }
  },
  /**
   * Returns a computed `localize` method, based on the current `language`.
   */
  computeLocalize: function () {
    let proto = this.constructor.prototype;

    // Everytime any of the parameters change, invalidate the strings cache.
    proto.localizationCache.messages = {};

    //If resources as string, then parse it to JSON object
    let resources =  RUFUtilities.localizationResources;
    let language = this.language = this.language || RUFUtilities.localeLanguage;
    let formats = this.formats;
    
    if(!_.isEmpty(resources) && typeof resources == "string") {
      resources = JSON.parse(resources);
    }
    
    let _self = this;
    proto.__localize = function () {
      let key = arguments[0];
      if (!key || !resources || !language || !resources[language])
        return;

      // Cache the key/value pairs for the same language, so that we don't
      // do extra work if we're just reusing strings across an application.
      let translatedValue = resources[language][key];

      if (!translatedValue) {
        return _self.useKeyIfMissing ? key : '';
      }

      let messageKey = key + translatedValue;
      let translatedMessage = proto.localizationCache.messages[messageKey];

      if (!translatedMessage) {
        translatedMessage = new IntlMessageFormat(translatedValue, language, formats);
        proto.localizationCache.messages[messageKey] = translatedMessage;
      }

      let args = {};
      for (let i = 1; i < arguments.length; i += 2) {
        args[arguments[i]] = arguments[i + 1];
      }
      return translatedMessage.format(args);
    };
    return proto.__localize;
  },
  onRequestResponse: function (event) {
    RUFUtilities.localizationResources = event.detail.__data.response;
    this.dispatchEvent(new CustomEvent('localize-resources-loaded', { bubbles: true, composed: true }));
  },
  onRequestError: function (event) {
    this.dispatchEvent(new CustomEvent('localize-resources-error', { bubbles: true, composed: true }));
  }
};
