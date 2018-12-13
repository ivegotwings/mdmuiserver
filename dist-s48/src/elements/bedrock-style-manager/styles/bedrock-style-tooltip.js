import '@polymer/polymer/polymer-legacy.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="bedrock-style-tooltip">
    <template>
      <style>
     [data-tooltip],
            .tooltip {
                position: relative;
            }

            /* Base styles for the entire tooltip */

            [data-tooltip]:before,
            [data-tooltip]:after,
            .tooltip:before,
            .tooltip:after {
                position: absolute;
                -ms-filter: "alpha(opacity=0)";
                filter: alpha(opacity=0);
                filter: progid:DXImageTransform.Microsoft.Alpha(opacity=0);
                -moz-opacity: 0;
                -khtml-opacity: 0;
                opacity: 0;
                pointer-events: none;
                -webkit-transition: all 0.2s;
                -moz-transition: all 0.2s;
                transition: all 0.2s;
                z-index: 9;
            }

            /* IE edge specific fix for data-tooltip - not displaying tooltip in hover */
            _:-ms-lang(x),
            [data-tooltip]:before,
            [data-tooltip]:after,
            .tooltip:before,
            .tooltip:after {
                transition: initial;
            }

            /* Show the entire tooltip on hover and focus */

            [data-tooltip]:hover:before,
            [data-tooltip]:hover:after,
            [data-tooltip]:focus:before,
            [data-tooltip]:focus:after,
            .tooltip:hover:before,
            .tooltip:hover:after,
            .tooltip:focus:before,
            .tooltip:focus:after {
                -ms-filter: "alpha(opacity=100)";
                filter: alpha(opacity=100);
                filter: progid:DXImageTransform.Microsoft.Alpha(opacity=100);
                -moz-opacity: 1;
                -khtml-opacity: 1;
                opacity: 1;
            }

            /* Base styles for the tooltip's directional arrow */

            .tooltip:before,
            [data-tooltip]:before {
                z-index: 99;
                border: 5px solid transparent;
                background: transparent;
                content: "";
            }

            /* Base styles for the tooltip's content area */

            .tooltip:after,
            [data-tooltip]:after {
                z-index: 99;
                padding: 3px 5px;
                background-color: var(--tooltip-bg-color, rgba(25, 32, 39, 1));
                color: var(--tooltip-text-color, #ffffff);
                content: attr(data-tooltip);
                font-size: var(--font-size-sm, 12px);
                line-height: 1.2;
                border-radius: 3px;
                text-align: center;
                word-wrap: break-word;
                max-width: 500px;
            }

            /* Directions */

            /* Bottom */

            .tooltip-bottom:before,
            .tooltip-bottom:after,
            .tooltip-bottom:before,
            .tooltip-bottom:after {
                top: 100%;
                bottom: auto;
                left: 50%;
            }

            .tooltip-bottom:after {
                margin-top: 9px;
            }

            .tooltip-bottom:before {
                border-top-color: transparent;
                border-bottom-color: var(--tooltip-bg-color, rgba(25, 32, 39, 1));
            }

            .tooltip-bottom:hover:before,
            .tooltip-bottom:hover:after,
            .tooltip-bottom:focus:before,
            .tooltip-bottom:focus:after {
                top: 80%;
            }

            .tooltip-top:after,
            .tooltip-bottom:after,
            .tooltip-top:before,
            .tooltip-bottom:before {
                -webkit-transform: translateX(-50%) !important;
                -moz-transform: translateX(-50%) !important;
                transform: translateX(-50%) !important;
            }

            /* Top (default) */

            .tooltip-top:before,
            .tooltip-top:after,
            .tooltip-top:before,
            .tooltip-top:after {
                bottom: 100%;
                top: auto;
                left: 50%;
            }

            .tooltip-top:after {
                margin-bottom: 10px;
            }

            .tooltip-top:before {
                border-bottom-color: transparent;
                border-top-color: var(--tooltip-bg-color, rgba(25, 32, 39, 1));
            }

            .tooltip-top:hover:before,
            .tooltip-top:hover:after,
            .tooltip-top:focus:before,
            .tooltip-top:focus:after {
                bottom: 80%;
            }

            /* Left */

            .tooltip-left:before,
            .tooltip-left:after {
                right: 100%;
                top: 50%;
                left: auto;
            }

            .tooltip-left:after {
                margin-right: 10px;
            }

            .tooltip-left:before {
                margin-left: 0;
                margin-bottom: 0;
                border-top-color: transparent;
                border-left-color: var(--tooltip-bg-color, rgba(25, 32, 39, 1));
            }

            .tooltip-left:hover:before,
            .tooltip-left:hover:after,
            .tooltip-left:focus:before,
            .tooltip-left:focus:after {
                right: 80%;
            }

            /* Right */

            .tooltip-right:before,
            .tooltip-right:after {
                top: 50%;
                left: 100%;
                right: auto;
            }

            .tooltip-right:after {
                margin-left: 10px;
            }

            .tooltip-right:before {
                margin-bottom: 0;
                border-top-color: transparent;
                border-right-color: var(--tooltip-bg-color, rgba(25, 32, 39, 1));
            }

            .tooltip-right:hover:before,
            .tooltip-right:hover:after,
            .tooltip-right:focus:before,
            .tooltip-right:focus:after {
                left: 80%;
            }

            /* Move directional arrows down a bit for left/right tooltips */

            .tooltip-left:after,
            .tooltip-right:after,
            .tooltip-left:before,
            .tooltip-right:before {
                -webkit-transform: translateY(-50%) !important;
                -moz-transform: translateY(-50%) !important;
                transform: translateY(-50%) !important;
            }
          
        </style>
     </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
