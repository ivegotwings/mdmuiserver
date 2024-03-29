/**
`pebble-bulk-file-upload-file-item` Represents a file in the file list of `pebble-bulk-file-upload`.
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import { OptionalMutableData } from '@polymer/polymer/lib/mixins/mutable-data.js';
import '@polymer/paper-progress/paper-progress.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-icon/pebble-icon.js';

class PebbleBulkFileUploadFileItem extends OptionalMutableData(PolymerElement) {
  static get template() {
    return html`
    <style include="bedrock-style-icons">
      :host {
        @apply --layout-vertical;
        margin: 4px 0 0;
        padding: 6px 0 4px;
        @apply --pebble-bulk-file-upload-file-item;
      }

      #row {
        @apply --layout-horizontal;
        @apply --layout-center;
        height: 36px;
        @apply --pebble-bulk-file-upload-file-item-row;
      }

      pebble-icon {
        padding: 8px;
        color: var(--primary-text-color, #212121);
        opacity: 0;
        margin-right: -40px;
        transition: margin-right 0.3s 0.1s, opacity 0.3s;
        @apply --pebble-bulk-file-upload-file-item-status-icon;
      }

      pebble-icon[icon="pebble-icon:notification-warning"] {
        color: var(--error-color, #ed204c);
      }

      pebble-icon[complete],
      pebble-icon[error] {
        margin-right: 0;
        opacity: 1;
        transition: margin-right 0.3s, opacity 0.3s 0.1s;
      }

      pebble-icon[complete] {
        @apply --pebble-bulk-file-upload-file-item-status-icon-complete;
      }

      pebble-icon[error] {
        @apply --pebble-bulk-file-upload-file-item-status-icon-error;
      }

      #meta {
        @apply --layout-vertical;
        @apply --layout-flex;
        height: 32px;
        transition: height 0.1s;
        width: 1px;
        color: var(--disabled-text-color, #bdbdbd);
        overflow: hidden;
        justify-content: center;
        @apply --pebble-bulk-file-upload-file-item-meta;
      }

      #meta[complete] {
        height: 16px;
        color: var(--primary-text-color, #212121);
        @apply --pebble-bulk-file-upload-file-item-meta-complete;
      }

      #meta[error] {
        color: var(--error-color, #ed204c);
        @apply --pebble-bulk-file-upload-file-item-meta-error;
      }

      #name,
      #status,
      #error {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: center;
        line-height: 16px !important;
      }

      #name {
        @apply --paper-font-body2;
        @apply --pebble-bulk-file-upload-file-item-name;
      }

      #status {
        @apply --paper-font-caption;
        color: var(--disabled-text-color, #bdbdbd);
        @apply --pebble-bulk-file-upload-file-item-status;
      }

      #error {
        @apply --paper-font-caption;
        color: var(--error-color, #ed204c);
        @apply --pebble-bulk-file-upload-file-item-error;
      }

      #commands {
        @apply --layout-horizontal;
        @apply --pebble-bulk-file-upload-file-item-commands;
      }

      #commands [icon] {
        color: var(--primary-text-color, #212121);
      }
      paper-progress {
        --paper-progress-active-color: var(--palette-cerulean-two, #026bc3);
        width: 100%;
        height: 2px;
        @apply --pebble-bulk-file-upload-file-item-progress;
      }

      paper-progress[error] {
        --paper-progress-container-color: var(--error-color, #ed204c);
        --paper-progress-active-color: var(--error-color, #ed204c);
        @apply --pebble-bulk-file-upload-file-item-progress-error;
      }

      paper-progress[indeterminate] {
        --paper-progress-container-color: var(--primary-color, #00B4F0);
        --paper-progress-active-color: rgba(1, 97, 155, 0.5);
        @apply --pebble-bulk-file-upload-file-item-progress-indeterminate;
      }

      paper-progress[uploading][indeterminate] {
        --paper-progress-container-color: var(--divider-color, #e0e0e0);
        --paper-progress-active-color: var(--disabled-text-color, #bdbdbd);
        @apply --pebble-bulk-file-upload-file-item-progress-uploading-indeterminate;
      }

      paper-progress[complete] {
        @apply --pebble-bulk-file-upload-file-item-progress-complete;
      }

      pebble-icon[hidden] {
        display: none;
      }

      :host(.fade-out) {
        animation-name: fade-out;
        animation-duration: 0.6s;
        @apply --pebble-bulk-file-upload-file-item-canceled;
      }

      @keyframes fade-out {
        0% {
          max-height: 38px;
        }

        33% {
          max-height: 38px;
          margin: 4px 0 0;
          padding: 6px 0 4px;
          opacity: 0.25;
        }

        67% {
          opacity: 0;
        }

        100% {
          max-height: 0;
          margin: 0;
          padding: 0;
          opacity: 0;
        }
      }
    </style>

    <div id="row">

      <pebble-icon icon="pebble-icon:action-done" class="pebble-icon-size-30" complete\$="[[file.complete]]"></pebble-icon>
      <pebble-icon icon="pebble-icon:notification-warning" class="pebble-icon-size-30" error\$="[[file.error]]"></pebble-icon>

      <div id="meta" complete\$="[[file.complete]]" error\$="[[file.error]]">
        <div id="name">[[file.name]]</div>
        <div id="status" hidden\$="[[!file.status]]">[[file.status]]</div>
        <div id="error" hidden\$="[[!file.error]]">[[file.error]]</div>
      </div>

      <div id="commands">
        <!--Design of S3 upload does not support retry.. hence currently removing retry option -->
        <!--<pebble-icon icon="pebble-bulk-file-upload:refresh" file-event="file-retry" on-tap="_fireFileEvent" hidden\$="[[!file.error]]"></pebble-icon>-->
        <pebble-icon icon="pebble-icon:governance-failed" file-event="file-abort" on-tap="_fireFileEvent">
      </pebble-icon></div>

    </div>

    <paper-progress id="progress" value\$="[[file.progress]]" error\$="[[file.error]]" indeterminate\$="[[file.indeterminate]]" uploading\$="[[file.uploading]]" complete\$="[[file.complete]]">
    </paper-progress>
`;
  }

  static get is() { return 'pebble-bulk-file-upload-file-item' }


  static get properties() {
    return {
      /**
       * Specifies the metadata about the`file`, upload status, and progress information.
       */
      file: Object
    }
  }
  static get observers() {
    return [
      '_fileChanged(file.*)',
      '_fileAborted(file.abort)'
    ]
  }

  disconnectedCallback() {
    this.removeEventListener('animationend', this._fireFileRemoveEvent)
  }

  _fileChanged() {
    if (this.file != undefined) {
      this.$.progress.updateStyles();
    }
  }

  _fileAborted(abort) {
    if (abort) {
      this.toggleClass('fade-out', true);
      let animationName = window.getComputedStyle(this).animationName;
      if (!animationName || animationName === 'none') {
        this.dispatchEvent(new CustomEvent('file-remove', { detail: { file: this.file }, bubbles: true, composed: true }));
      } else {
        this.addEventListener('animationend', this._fireFileRemoveEvent);
      }
    }
  }

  _fireFileRemoveEvent () {
    this.dispatchEvent(new CustomEvent('file-remove', { detail: { file: this.file }, bubbles: true, composed: true }));
  }

  _fireFileEvent(e) {
    e.preventDefault();
    let button = e.target;
    return this.dispatchEvent(new CustomEvent(button.getAttribute('file-event'), { detail: { file: this.file }, bubbles: true, composed: true }));
  }

  /**
   * Fired when the retry button is pressed. It is listened by `pebble-bulk-file-upload`
   * which starts a new upload process of this file.
   *
   * @event file-retry
   * @param {Object} detail
   *  @param {Object} detail.file file to retry upload of
   */

  /**
   * Fired when the abort button is pressed. It is listened by `pebble-bulk-file-upload` which
   * aborts the upload operation which is in progress. It does not remove the file from the list
   * which allows the animation to hide the element.
   *
   * @event file-abort
   * @param {Object} detail
   *  @param {Object} detail.file file to abort upload of
   */

  /**
   * Fired after the animation to hide the element. It is listened
   * by `pebble-upload` which removes the file from the upload
   * file list.
   *
   * @event file-remove
   * @param {Object} detail
   *  @param {Object} detail.file file to remove from the  upload of
   */
}
customElements.define(PebbleBulkFileUploadFileItem.is, PebbleBulkFileUploadFileItem);
