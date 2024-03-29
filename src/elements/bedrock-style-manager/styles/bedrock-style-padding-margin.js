import '@polymer/polymer/polymer-legacy.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="bedrock-style-padding-margin">
    <template>
        <style>
            .m-0 {
                margin: 0;
            }
            .m-10 {
                margin: 10px;
            }
            .m-15 {
                margin: 15px;
            }
            .m-20 {
                margin: 20px;
            }
            .m-t-5 {
                margin-top: 5px;
            }
            .m-t-10 {
                margin-top: 10px;
            }
            .m-t-15 {
                margin-top: 15px;
            }
            .m-t-20 {
                margin-top: 20px;
            }
            .m-t-25 {
                margin-top: 25px;
            }
            .m-r-5 {
                margin-right: 5px;
            }
            .m-r-10 {
                margin-right: 10px;
            }
            .m-r-15 {
                margin-right: 15px;
            }
            .m-r-20 {
                margin-right: 20px;
            }
            .m-b-5 {
                margin-bottom: 5px;
            }
            .m-b-10 {
                margin-bottom: 10px;
            }
            .m-b-20 {
                margin-bottom: 20px;
            }
            .m-l-5 {
                margin-left: 5px;
            }
            .m-l-10 {
                margin-left: 10px;
            }
            .m-l-15 {
                margin-left: 15px;
            }
            .m-l-20 {
                margin-left: 20px;
            }

            /* padding layout */

            .p-0 {
                padding: 0;
            }
            .p-5 {
                padding: 5px;
            }
            .p-10 {
                padding: 10px;
            }
            .p-t-5 {
                padding-top: 5px;
            }
            .p-t-10 {
                padding-top: 10px;
            }
            .p-t-20 {
                padding-top: 20px;
            }
            .p-r-10 {
                padding-right: 10px;
            }
            .p-r-20 {
                padding-right: 20px;
            }
            .p-b-5 {
                padding-bottom: 5px;
            }
            .p-b-10 {
                padding-bottom: 10px;
            }
            .p-l-10 {
                padding-left: 10px;
            }
            .p-l-15 {
                padding-left: 15px;
            }
            .p-l-20 {
                padding-left: 20px;
            }
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
