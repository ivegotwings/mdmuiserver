import '@polymer/polymer/polymer-legacy.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="bedrock-style-scroll-bar">
    <template>
      <style>
      /* Scrollbar Styles Starts Chrome*/            
            ::-webkit-scrollbar {
                width: 14px;
                height: 14px;
                background: transparent;
            }            
            ::-webkit-scrollbar-thumb {                
                border: 4px solid rgba(0, 0, 0, 0);
                min-height: 25px;
                background-clip: padding-box;
                -webkit-border-radius: 7px;
                background-color: var(--palette-cloudy-blue, #c1cad4);
                ;
                -webkit-box-shadow: inset -1px -1px 0px var(--palette-cloudy-blue, #c1cad4), inset 1px 1px 0px var(--palette-cloudy-blue, #c1cad4);
            } 
            ::-webkit-scrollbar-button {
                width: 0;
                height: 0;
                display: none;
            }
            ::-webkit-scrollbar-corner {
                background-color: transparent;
            }
            /* Scrollbar Styles Starts Firefox*/      
            ::-moz-scrollbar{
                width: 14px;
                height: 14px;
                background:transperant;
            }            
            ::-moz-scrollbar-thumb {
                
                border: 4px solid rgba(0, 0, 0, 0);
                background-clip: padding-box;
                -webkit-border-radius: 7px;
                background-color: #fff;
                -webkit-box-shadow: inset -1px -1px 0px rgba(0, 0, 0, 0.05), inset 1px 1px 0px rgba(0, 0, 0, 0.05);
            }    
            ::-moz-scrollbar-button {
                width: 0;
                height: 0;
                display: none;
            }
            ::-moz-scrollbar-corner {
                background-color: transparent;
            }
            /* Scrollbar Styles Starts IE*/

            /* Scrollbar Styles Starts IE*/            
            ::-scrollbar {
                width: 14px;
                height: 14px;
                background:transperant;
            }            
            ::-scrollbar-thumb {                
                border: 4px solid rgba(0, 0, 0, 0);
                background-clip: padding-box;
                -webkit-border-radius: 7px;
                background-color: #fff;
                -webkit-box-shadow: inset -1px -1px 0px rgba(0, 0, 0, 0.05), inset 1px 1px 0px rgba(0, 0, 0, 0.05);
            }
            ::-scrollbar-button {
                width: 0;
                height: 0;
                display: none;
            }
            ::-scrollbar-corner {
                background-color: transparent;
            }  
          
        </style>
     </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
