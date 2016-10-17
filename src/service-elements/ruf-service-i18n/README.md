##RUFBehaviors.Internationalization

`RUFBehaviors.Internationalization` wraps the [format.js](http://formatjs.io/) library to
help you internationalize your application. Note that if you're on a browser that
does not natively support the [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
object, you must load the polyfill yourself. An example polyfill can
be found [here](https://github.com/andyearnshaw/Intl.js/).

`RUFBehaviors.Internationalization` supports the same [message-syntax](http://formatjs.io/guides/message-syntax/)
of format.js, in its entirety; use the library docs as reference for the
available message formats and options.

Sample application loading resources from an external file using initialization component:

```html
<ruf-service-init locale-resource-path="locales.json" default-language="en"></ruf-service-init>
<remote-resource></remote-resource>
```

Alternatively, you can also inline your resources inside the app itself:

```html
<dom-module id="demo-app">
   <template>
    <div>{{localize('hello', 'name', 'Batman')}}</div>
   </template>
   <script>
      Polymer({
        is: "demo-app",

        behaviors: [
          RUFBehaviors.Internationalization
        ],

        properties: {
          language: {
            value: 'en'
          },
          resources: {
            value: function() {
              return {
                'en': { 'hello': 'My name is {name}.' },
                'fr': { 'hello': 'Je m\'apelle {name}.' }
              }
          }
        }
      });
   &lt;/script>
</dom-module>
```


