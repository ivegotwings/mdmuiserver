import '@polymer/polymer/polymer-legacy.js';
import './bedrock-style-scroll-bar.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="bedrock-style-gridsystem">
    <template>
        <style include="bedrock-style-scroll-bar">
            .column {
                display: -webkit-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: flex;
                box-sizing: border-box;
                -webkit-box-orient: vertical;
                -webkit-flex-direction: column;
                flex-direction: column;
            }

            .col,
            .col-90,
            .colspan-1,
            .colspan-2,
            .colspan-3,
            .colspan-4 {
                -ms-flex: 0 0 auto;
                -webkit-box-flex: 0;
                flex: 0 0 auto;
                padding: var(--gutter-width);
                box-sizing: border-box;
            }

            .col,
            .colspan-1 {
                -webkit-flex-grow: 1;
                -ms-flex-positive: 1;
                -webkit-box-flex: 1;
                flex-grow: 1;
                -ms-flex-preferred-size: 0;
                flex-basis: 0;
                max-width: 100%;
            }

            .colspan-2 {
                -ms-flex-preferred-size: 50%;
                flex-basis: 50%;
                max-width: 50%;
            }

            .colspan-3 {
                -ms-flex-preferred-size: 33.33%;
                flex-basis: 33.33%;
                max-width: 33.33%;
            }

            .colspan-4 {
                -ms-flex-preferred-size: 25%;
                flex-basis: 25%;
                max-width: 25%;
            }

            .col-90 {
                -ms-flex-preferred-size: 90%;
                flex-basis: 90%;
                max-width: 90%;
            }

            /* Flexible layout */

            .row,
            .row-wrap {
                display: -webkit-box;
                display: -webkit-flex;
                display: -ms-flexbox;
                display: flex;
            }

            .row-wrap {
                margin-right: -10px;
                margin-left: -10px;
            }

            .row-container {
                padding-right: 10px;
                padding-left: 10px;
                margin-left: auto;
                margin-right: auto;
                max-width: 100%;
                width: 100%;
            }

            .col,
            .col-1,
            .col-2,
            .col-3,
            .col-4,
            .col-5,
            .col-6,
            .col-7,
            .col-8,
            .col-9,
            .col-10,
            .col-11,
            .col-12 {
                padding: 0 10px 0 10px;
            }

            .no-gutters>.col,
            .no-gutters>[class*=col-] {
                padding-right: 0;
                padding-left: 0;
            }

            .col {
                -webkit-flex-basis: 0;
                -ms-flex-preferred-size: 0;
                flex-basis: 0;
                -webkit-box-flex: 1;
                -webkit-flex-grow: 1;
                -ms-flex-positive: 1;
                flex-grow: 1;
                max-width: 100%;
            }

            .col-1 {
                -webkit-box-flex: 0;
                -webkit-flex: 0 0 8.333333%;
                -ms-flex: 0 0 8.333333%;
                flex: 0 0 8.333333%;
                max-width: 8.333333%;
            }

            .col-2 {
                -webkit-box-flex: 0;
                -webkit-flex: 0 0 16.666667%;
                -ms-flex: 0 0 16.666667%;
                flex: 0 0 16.666667%;
                max-width: 16.666667%;
            }

            .col-3 {
                -webkit-box-flex: 0;
                -webkit-flex: 0 0 25%;
                -ms-flex: 0 0 25%;
                flex: 0 0 25%;
                max-width: 25%;
            }

            .col-4 {
                -webkit-box-flex: 0;
                -webkit-flex: 0 0 33.333333%;
                -ms-flex: 0 0 33.333333%;
                flex: 0 0 33.333333%;
                max-width: 33.333333%;
            }

            .col-5 {
                -webkit-box-flex: 0;
                -webkit-flex: 0 0 41.666667%;
                -ms-flex: 0 0 41.666667%;
                flex: 0 0 41.666667%;
                max-width: 41.666667%;
            }

            .col-6 {
                -webkit-box-flex: 0;
                -webkit-flex: 0 0 50%;
                -ms-flex: 0 0 50%;
                flex: 0 0 50%;
                max-width: 50%;
            }

            .col-7 {
                -webkit-box-flex: 0;
                -webkit-flex: 0 0 58.333333%;
                -ms-flex: 0 0 58.333333%;
                flex: 0 0 58.333333%;
                max-width: 58.333333%;
            }

            .col-8 {
                -webkit-box-flex: 0;
                -webkit-flex: 0 0 66.666667%;
                -ms-flex: 0 0 66.666667%;
                flex: 0 0 66.666667%;
                max-width: 66.666667%;
            }

            .col-9 {
                -webkit-box-flex: 0;
                -webkit-flex: 0 0 75%;
                -ms-flex: 0 0 75%;
                flex: 0 0 75%;
                max-width: 75%;
            }

            .col-10 {
                -webkit-box-flex: 0;
                -webkit-flex: 0 0 83.333333%;
                -ms-flex: 0 0 83.333333%;
                flex: 0 0 83.333333%;
                max-width: 83.333333%;
            }

            .col-11 {
                -webkit-box-flex: 0;
                -webkit-flex: 0 0 91.666667%;
                -ms-flex: 0 0 91.666667%;
                flex: 0 0 91.666667%;
                max-width: 91.666667%;
            }

            .col-12 {
                -webkit-box-flex: 0;
                -webkit-flex: 0 0 100%;
                -ms-flex: 0 0 100%;
                flex: 0 0 100%;
                max-width: 100%;
            }

            /* Offset styles start*/

            .offset-1 {
                margin-left: 8.333333%;
            }

            .offset-2 {
                margin-left: 16.666667%;
            }

            .offset-3 {
                margin-left: 25%;
            }

            .offset-4 {
                margin-left: 33.333333%;
            }

            .offset-5 {
                margin-left: 41.666667%;
            }

            .offset-6 {
                margin-left: 50%;
            }

            .offset-7 {
                margin-left: 58.333333%;
            }

            .offset-8 {
                margin-left: 66.666667%;
            }

            .offset-9 {
                margin-left: 75%;
            }

            .offset-10 {
                margin-left: 83.333333%;
            }

            .offset-11 {
                margin-left: 91.666667%;
            }
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
