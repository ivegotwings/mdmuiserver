import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/array-selector.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import '../bedrock-externalref-polymerquill/bedrock-externalref-polymerquill.js';
import '../bedrock-validator/bedrock-validator.js';
import '../bedrock-style-manager/styles/bedrock-style-scroll-bar.js';
import '../pebble-info-icon/pebble-info-icon.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
class PebbleRichtexteditor extends PolymerElement {
  static get template() {
    return html`
        <style include="quill-core quill-snow bedrock-style-common bedrock-style-scroll-bar">
            label {
                font-size: var(--font-size-sm, 12px) !important;
                color: var(--input-label-color, #96b0c6);
                line-height: 17px;
                margin-top: 17px;
            }
            #viewBox {
                border: none!important;
                border-bottom: 1px solid #E0E0E0 !important;
            }
            .ql-editor {
                border: 1px solid #c1c1c1!important;
                border-top: 0;
                font-size: var(--font-size-sm, 12px)!important;
                color: var(--attrpanel-color-text, #1a2028);
                max-height:200px;
            }
            .viewBox-editor {
                max-height:200px;
            }

            .ql-container.pebble-richtexteditor {
                font-size: var(--font-size-sm, 12px);
                border: 1px solid #ccc;
                padding: 10px;
            }

            .ql-container.pebble-richtexteditor p {
                margin: 0;
            }

            .ql-toolbar.pebble-richtexteditor button.pebble-richtexteditor:hover {
                outline: none;
            }

            .ql-toolbar {
                padding: 7px;
                border: 1px solid #c1c1c1;
            }

            .ql-toolbar button {
                display: inline-block;
                vertical-align: middle;
                margin-right: 4px;
                width: 24px;
                height: 24px;
                border: 0;
                outline: none;
                background: url("../../src/images/quill-icons-sprite.png") no-repeat #fff -999px -999px;
            }
            
            .ql-size-huge {
                font-size: 2.5em;
                line-height: 2.5em;
            }

            .ql-size-large {
                font-size: 1.5em;
                line-height: 1.5em;
            }

            .ql-size-small {
                font-size: 0.75em;
                line-height: 0.75em;
            }            

            .ql-toolbar button:hover {
                outline: 1px solid #c1c1c1;
            }

            button.ql-list[value="bullet"] {
                background-position: 0 0;
            }

            button.ql-list[value="ordered"] {
                background-position: -24px 0;
            }

            button.ql-indent[value="-1"] {
                background-position: -48px 0;
            }

            button.ql-indent[value="+1"] {
                background-position: -72px 0;
            }

            button.ql-bold {
                background-position: -96px 0!important;
            }

            button.ql-active {
                outline: 1px solid #06c;
            }

            button.ql-italic {
                background-position: -120px 0!important;
            }

            button.ql-underline {
                background-position: -144px 0!important;
            }

            button.ql-strike {
                background-position: -168px 0!important;
            }

            button.ql-script[value="sub"] {
                background-position: -192px 0;
            }

            button.ql-script[value="super"] {
                background-position: -216px 0;
            }

            button.ql-header[value="1"] {
                background-position: -288px 0;
            }

            button.ql-header[value="2"] {
                background-position: -312px 0;
            }

            button.ql-link {
                background-position: -360px 0 !important;
            }

            button.ql-image {
                background-position: -384px 0;
            }

            button.ql-clean {
                background-position: -408px 0 !important;
            }

            /* custom select */

            .ql-select {
                position: relative;
                display: inline-block;
                vertical-align: middle;
                height: 24px;
            }

            .ql-select select {
                display: none;
            }

            .ql-select-area {
                outline: none;
            }

            .ql-select.active .ql-select-area {
                outline: 1px solid #c1c1c1;
            }

            .ql-select-area .wrapper {
                display: none;
                position: absolute;
                left: -1px;
                top: 24px;
                z-index: 50;
                background-color: #ffffff;
                border: 1px solid #c1c1c1;
                box-shadow: rgba(0, 0, 0, 0.2) 0 2px 8px;
                padding: 5px;
            }

            .ql-select.active .ql-select-area .wrapper {
                display: block;
            }

            /* select font size */

            .ql-select-size {
                position: relative;
                margin-right: 4px;
                width: 96px;
                height: 24px;
            }
            #content{
                background-color: var(--palette-white, #ffffff);
            }

            .ql-select-size::before {
                pointer-events: none;
                position: absolute;
                top: 0;
                right: 0;
                content: "";
                display: inline-block;
                width: 24px;
                height: 24px;
                border: 0;
                opacity: 1;
                transition: none;
                visibility: visible;
                background: url("../../src/images/quill-icons-sprite.png") no-repeat #fff 0 -24px;
            }

            .ql-select-size .value {
                font-size: var(--font-size-sm, 12px);
                pointer-events: none;
                padding: 2px 2px 2px 8px;
                font-weight: bold;
                text-transform: capitalize;
            }

            .ql-select-size .value:empty::before {
                content: "Normal";
            }

            .ql-select-size .wrapper {
                width: 120px;
            }

            .ql-select-size .ql-select-option {
                padding: 5px 10px;
                text-transform: capitalize;
            }

            .ql-select-size .ql-select-option:hover {
                color: #0000ff;
            }

            .ql-select-size .ql-select-option[data-value="small"] {
                font-size: 10px;
            }
            
            .ql-select-size .ql-select-option[data-value="large"] {
                font-size: 18px;
            }

            .ql-select-size .ql-select-option[data-value="huge"] {
                font-size: 32px;
            }

            /* select background and text color */

            .ql-select-background,
            .ql-select-color {
                display: inline-block;
                margin-right: 4px;
                width: 24px;
                height: 24px;
                border: 0;
                outline: none;
                background: url("../../src/images/quill-icons-sprite.png") no-repeat #fff -240px 0;
            }

            .ql-select-color {
                background: url("../../src/images/quill-icons-sprite.png") no-repeat #fff -264px 0;
            }

            .ql-select-background:hover,
            .ql-select-color:hover {
                outline: 1px solid #c1c1c1;
            }

            .ql-select-background .ql-select-option[active],
            .ql-select-color .ql-select-option[active] {
                outline: 1px solid #999;
                border-color: #fff;
            }

            .ql-select-background .wrapper,
            .ql-select-color .wrapper {
                font-size: 0;
                width: 153px;
            }

            .ql-select-background .ql-select-option,
            .ql-select-color .ql-select-option {
                display: inline-block;
                width: 16px;
                height: 16px;
                margin: 2px;
                border: 1px solid transparent;
            }

            .ql-select-color .ql-select-option:hover {
                outline: 1px solid #999;
                border-color: #fff;
            }

            /* select background and text color */

            .ql-select-align {
                display: inline-block;
                margin-right: 4px;
                width: 24px;
                height: 24px;
                border: 0;
                outline: none;
                background: url("../../src/images/quill-icons-sprite.png") no-repeat #fff -336px 0;
            }

            .ql-select-align:hover {
                outline: 1px solid #c1c1c1;
            }

            .ql-select-align .wrapper {
                padding: 5px;
            }

            .ql-select-align .ql-select-option {
                width: 24px;
                height: 24px;
                background: url("../../src/images/quill-icons-sprite.png") no-repeat;
            }

            .ql-select-align .ql-select-option:hover {
                outline: 1px solid #c1c1c1;
            }

            .ql-select-align .ql-select-option[data-value="center"] {
                background-position: -48px -24px;
            }

            .ql-select-align .ql-select-option[data-value="right"] {
                background-position: -72px -24px;
            }

            .ql-select-align .ql-select-option[data-value="justify"] {
                background-position: -96px -24px;
            } 
            h1 {
                line-height: 2em;
            }   
            h2{
                line-height: 1.5em;
            } 
            .attribute-view-label {
                font-size: var(--font-size-sm, 12px);
                font-family: 'Roboto', Helvetica, Arial, sans-serif;
                font-weight: normal;
                font-style: normal;
                font-stretch: normal;
                line-height: 16px;
                text-transform: capitalize;
                color: var(--label-text-color, #96b0c6);
                @apply --context-coalesce-label;
            }               
        </style>

        <div hidden\$="[[readOnly]]">

            <div class="attribute-view-label" hidden\$="[[!label]]" aria-hidden="true">
                [[label]]
                <template is="dom-if" if="[[descriptionObject]]">
                    <pebble-info-icon description-object="[[descriptionObject]]"></pebble-info-icon>
                </template>
            </div>

            <div id="content">
                <div id="toolbar">

                    <div class="ql-select" title="Size">
                        <select class="ql-size" id="qlNativeSelectSize">
                            <template is="dom-repeat" items="{{fontSizes}}">
                                <option value="{{item}}"></option>
                            </template>
                        </select>

                        <div class="ql-select-area ql-select-size" on-tap="_toggleDropdown">
                            <div class="value">{{selectedFontSize}}</div>

                            <div class="wrapper">
                                <template is="dom-repeat" id="fontSizesList" items="{{fontSizes}}">
                                    <div class="ql-select-option" data-value\$="{{item}}">{{item}}</div>
                                </template>
                            </div>
                        </div>

                        <array-selector id="fontSizeSelector" items="{{fontSizes}}" selected="{{selectedFontSize}}" toggle=""></array-selector>
                    </div>

                    <button type="button" class="ql-list" title="Bulleted List" value="bullet"></button>
                    <button type="button" class="ql-list" title="Ordered List" value="ordered"></button>

                    <button type="button" class="ql-indent" title="Decrease Indent" value="-1"></button>
                    <button type="button" class="ql-indent" title="Increase Indent" value="+1"></button>

                    <button type="button" class="ql-bold" title="Bold"></button>
                    <button type="button" class="ql-italic" title="Italic"></button>
                    <button type="button" class="ql-underline" title="Underline"></button>
                    <button type="button" class="ql-strike" title="Strike"></button>
                    <button type="button" class="ql-script" title="Subscript" value="sub"></button>
                    <button type="button" class="ql-script" title="Superscript" value="super"></button>

                    <div class="ql-select" title="Background color">
                        <select class="ql-background" id="qlNativeSelectBackground">
                            <template is="dom-repeat" items="{{backgroundColors}}">
                                <option value="{{item}}"></option>
                            </template>
                        </select>

                        <div class="ql-select-area ql-select-background" on-tap="_toggleDropdown">
                            <div class="wrapper">
                                <template is="dom-repeat" id="backgroundColorsList" items="{{backgroundColors}}">
                                    <div class="ql-select-option" active\$="{{_isSelectedBackgroundColor(item, selectedBackgroundColor)}}" style\$="background-color: {{item}}"></div>
                                </template>
                            </div>
                        </div>

                        <array-selector id="backgroundColorSelector" items="{{backgroundColors}}" selected="{{selectedBackgroundColor}}" toggle=""></array-selector>
                    </div>

                    <div class="ql-select" title="Color">
                        <select class="ql-color" id="qlNativeSelectColor">
                            <template is="dom-repeat" items="{{colors}}">
                                <option value="{{item}}"></option>
                            </template>
                        </select>

                        <div class="ql-select-area ql-select-color" on-tap="_toggleDropdown">
                            <div class="wrapper">
                                <template is="dom-repeat" id="colorsList" items="{{colors}}">
                                    <div class="ql-select-option" active\$="{{_isSelectedColor(item, selectedColor)}}" style\$="background-color: {{item}}"></div>
                                </template>
                            </div>
                        </div>

                        <array-selector id="colorSelector" items="{{colors}}" selected="{{selectedColor}}" toggle=""></array-selector>
                    </div>

                    <button class="ql-header " value="1" title="Header Big"></button>
                    <button class="ql-header " value="2" title="Header Medium"></button>

                    <div class="ql-select" title="Align">
                        <select class="ql-align" id="qlNativeSelectAlign">
                            <template is="dom-repeat" items="{{aligns}}">
                                <option value="{{item}}"></option>
                            </template>
                        </select>

                        <div class="ql-select-area ql-select-align" on-tap="_toggleDropdown">
                            <div class="wrapper">
                                <template is="dom-repeat" id="alignsList" items="{{aligns}}">
                                    <div class="ql-select-option" active\$="{{_isSelectedAlign(item, selectedAlign)}}" data-value\$="{{item}}"></div>
                                </template>
                            </div>
                        </div>

                        <array-selector id="alignSelector" items="{{aligns}}" selected="{{selectedAlign}}" toggle=""></array-selector>
                    </div>

                    <button type="button" class="ql-link" title="Link"></button>
                    <button type="button" class="ql-clean" title="Clean"></button>

                </div>
                <div id="editor"></div>
            </div>
        </div>

        <div hidden\$="[[!readOnly]]">
            <div class="attribute-view-label" hidden\$="[[!label]]" aria-hidden="true">
                [[label]]
                <template is="dom-if" if="[[descriptionObject]]">
                    <pebble-info-icon description-object="[[descriptionObject]]"></pebble-info-icon>
                </template>
            </div>
            <div id="viewBox" class="ql-editor viewBox-editor"></div>
        </div>
        <bedrock-validator show-error="[[showError]]" validation-errors="{{validationErrors}}" input="[[value]]" pattern="[[pattern]]" min-length="[[minlength]]" max-length="[[maxlength]]" precision="[[precision]]" required="[[required]]" invalid="{{invalid}}" error-message="{{errorMessage}}" min="[[min]]" max="[[max]]" type="[[validationType]]" type-array="[[validationTypeArray]]"></bedrock-validator>
`;
  }

  static get is() {
      return 'pebble-richtexteditor'
  }

  ready() {
      super.ready();
      let _this = this;
      this.quill = new Quill(this.$.editor, {
          modules: {
              toolbar: this.$.toolbar
          },
          placeholder: 'Enter the text here...'                    
      });
  }

  connectedCallback() {
      super.connectedCallback();
      let _this = this;
      this.quill.on('text-change', function (delta, oldDelta, source) {
          _this._onTextChangeDebounced();
      });
      const editor = this.$.editor.querySelector('.ql-editor');
      if (editor) {
          this.editor = editor;
          //When default as edit mode, then set the value as per editor availability
          if (!this.readOnly) {
              this._setEditorValue();
          }
      }

  }

  disconnectedCallback() {
      super.disconnectedCallback();
      let _this = this;
      this.quill.off('text-change', _this._onTextChangeDebounced());
  }

  static get properties() {
      return {
          /**
          * Indicates the label for the richtexteditor.
          * It allows to add descriptive text for the richtexteditor to inform the user about the type of data
          * expected in the richtexteditor.
          */
          label: {
              type: String
          },

          /**
          * Indicates the encoded html output from the richtexteditor.
          */
          value: {
              type: String,
              notify: true,
              observer: '_onValueChange'
          },

          /**
          * Specifies whether or not the richtexteditor is non-editable.
          * Set it to <b>true</b> to make the textbox read-only.
          */
          readOnly: {
              type: Boolean,
              value: false,
              observer: '_onReadOnlySet'

          },

          /**
          * Indicates the richtexteditor content container.
          */
          editor: {
              type: Object
          },

          /**
           * Description object should contain non-empty
           * description field (type type: Array or String)
           */
          descriptionObject: {
              type: Object,
              notify: true,
              value: function () {
                  return {};
              }
          },

          fontSizes: {
              type: Array,
              value: ["small", "large", "huge"]
          },

          backgroundColors: {
              type: Array,
              value: ["#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466", "#000000"]
          },

          colors: {
              type: Array,
              value: ["#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466", "#000000"]
          },

          aligns: {
              type: Array,
              value: ["center", "right", "justify"]
          },

          selectedValuesColor: {
              type: String,
              value: ""
          },

          selectedValuesFontStyle: {
              type: String,
              value: ""
          }
      }
  }

  static get observers() {
      return [
          '_selectedValueStyleChange(selectedValuesColor, selectedValuesFontStyle)'
      ]
  }


  _onReadOnlySet() {
      if (this.readOnly == true) {
          this._setViewModeValue();
      } else {
          this._setEditorValue();
      }
  }

  //Set the input value when the RTE is in edit mode
  _setEditorValue() {
      let editorContent = this.value;
      if (this.editor && editorContent && editorContent != "") {
          // this.editor.innerHTML = editorContent;
          this.quill.clipboard.dangerouslyPasteHTML(editorContent, "api");
      } 
  }

  //Set the input value when the RTE is in view mode
  _setViewModeValue() {
      this.$.viewBox.innerHTML = this.value;
  }

  // Debounce _onTextChange() method
  _onTextChangeDebounced() {
      this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(500), () => {
          this._onTextChange();
      });
  }

  /**
   * Function to get the quill editor output value for the given input value
  */
  getFormattedValue(inputValue){
      let tempQuill = new Quill(document.createElement("div"));
      let formattedValue = "";
      if(inputValue != ""){
          tempQuill.clipboard.dangerouslyPasteHTML(inputValue, "api"); 
          formattedValue = tempQuill.root.innerHTML;
      } 
      //Remove the tempQuill from the dom
      tempQuill.root.parentNode.removeChild(tempQuill.root);
      return formattedValue;
  }

  //Handle the text change event on the editor
  _onTextChange() {
      if (this.editor) {
          let encodedText = this.editor.innerHTML;
          //Return without doing anything for unchanged value
          if (this.value == encodedText) {
              return;
          } else if (encodedText.indexOf('<p>') > -1) { 
              //If no data is added by the user on the RTE, removing the empty <p></p> tag added by the quill
              let pattern = /<p>|<\/p>|<br>/gi;
              let tempValue;
              if(pattern.test(encodedText)) {
                  tempValue = encodedText.replace(pattern,"");
              }  
              if(tempValue.trim() == "") { 
                  this.value = "";
                  return;
              }
          }
          this.value = encodedText;
      }
  }

  //Handle the value change from the editor as well as outside controls like revert/clear
  _onValueChange() {
      if (this.editor) {
          let encodedText = this.editor.innerHTML;
          if (this.value == encodedText) { //value changed from editor
              return;
          } else if (this.value == "") {
              this.editor.innerHTML = "";
          } else if (this.value != encodedText) { //value changed from other controls like revert or clear
              // this.editor.innerHTML = this.value;
              this.quill.clipboard.dangerouslyPasteHTML(this.value, "api");
          }
      } else if (this.readOnly) { //On auto page refresh, value might change based on business rule
          this._setViewModeValue();
      }
  }

  _toggleDropdown(e) {
      e.target.closest(".ql-select").classList.toggle('active');

      if (e.target.classList.contains("ql-select-option")) {
          this._onSelect(e);
      }
  }

  _onSelect(e) {
      const classList = e.target.closest(".ql-select-area").classList;
      let nativeSelect, itemsList, selector, selectedItem;

      if (classList.contains("ql-select-size")) {
          nativeSelect = this.$.qlNativeSelectSize;
          itemsList = this.$.fontSizesList;
          selector = this.$.fontSizeSelector;
          selectedItem = this.selectedFontSize;
      }

      if (classList.contains("ql-select-background")) {
          nativeSelect = this.$.qlNativeSelectBackground;
          itemsList = this.$.backgroundColorsList;
          selector = this.$.backgroundColorSelector;
          selectedItem = this.selectedBackgroundColor;
      }

      if (classList.contains("ql-select-color")) {
          nativeSelect = this.$.qlNativeSelectColor;
          itemsList = this.$.colorsList;
          selector = this.$.colorSelector;
          selectedItem = this.selectedColor;
      }

      if (classList.contains("ql-select-align")) {
          nativeSelect = this.$.qlNativeSelectAlign;
          itemsList = this.$.alignsList;
          selector = this.$.alignSelector;
          selectedItem = this.selectedAlign;
      }

      let item = itemsList.itemForElement(e.target);
      let index = itemsList.indexForElement(e.target);

      if (selectedItem !== item) {
          selector.select(item);
      }

      nativeSelect.selectedIndex = index;
      nativeSelect.dispatchEvent(new Event("change"));
  }

  _isSelectedBackgroundColor(item, selectedBackgroundColor) {
      return item === selectedBackgroundColor;
  }

  _isSelectedColor(item, selectedColor) {
      return item === selectedColor;
  }

  _isSelectedAlign(item, selectedAlign) {
      return item === selectedAlign;
  }

  _selectedValueStyleChange(selectedValuesColor, selectedValuesFontStyle) {
      this.$.viewBox.style.color = selectedValuesColor;
      this.$.viewBox.style.fontStyle = selectedValuesFontStyle;
  }
}
customElements.define(PebbleRichtexteditor.is, PebbleRichtexteditor);
