##RUFBehaviors.NotificationGenerator

`RUFBehaviors.NotificationGenerator` this will send notification to all app user or specific app user.

Sample application for sending notification:

```html
<dom-module id="demo-app">
   <template>
   </template>
   <script>
      Polymer({
        is: "demo-app",

        behaviors: [
          RUFBehaviors.NotificationGenerator
        ],

        properties: {
          
        },
        myfunction: function() {
            this.sendMessageToAllUser("sent from client side NotificationManager . . . .");
        }
      });
   &lt;/script>
</dom-module>
```


