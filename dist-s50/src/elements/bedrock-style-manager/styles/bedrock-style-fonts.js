import '@polymer/polymer/polymer-legacy.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="bedrock-style-fonts">
    <template>
        <style>
            .font-12 {
                font-size: var(--font-size-sm, 12px);
            }

            .font-14 {
                font-size: var(--default-font-size, 14px);
            }

            .font-16 {
                font-size: var(--font-size-md, 16px);
            }

            .font-bold {
                font-weight: var(--font-bold, bold);
            }
            .font-w-100 {
                font-weight: 100;
            }

            .font-w-500 {
                font-weight: 500;
            }

            
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
