/**
`<pebble-bulk-file-upload>` Represents an element which uploads multiple files with drag and drop support.

### Example
<pebble-bulk-file-upload></pebble-bulk-file-upload>

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import '@polymer/paper-ripple/paper-ripple.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import '../bedrock-pubsub/bedrock-pubsub.js';
import '../bedrock-style-manager/styles/bedrock-style-common.js';
import '../bedrock-style-manager/styles/bedrock-style-text-alignment.js';
import '../bedrock-style-manager/styles/bedrock-style-padding-margin.js';
import '../bedrock-style-manager/styles/bedrock-style-icons.js';
import '../bedrock-style-manager/styles/bedrock-style-floating.js';
import '../bedrock-style-manager/styles/bedrock-style-grid-layout.js';
import '../pebble-icon/pebble-icon.js';
import '../pebble-icons/pebble-icons.js';
import '../pebble-button/pebble-button.js';
import './pebble-bulk-file-upload-file-item.js';
import { resetMouseCanceller } from '@polymer/polymer/lib/utils/gestures.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

class PebbleBulkFileUpload
  extends mixinBehaviors([
    RUFBehaviors.UIBehavior,
    RUFBehaviors.ComponentContextBehavior
  ], PolymerElement) {
  static get template() {
    return html`
    <style include="bedrock-style-common bedrock-style-scroll-bar bedrock-style-floating bedrock-style-grid-layout bedrock-style-icons bedrock-style-padding-margin bedrock-style-text-alignment">
      :host {
        display: block;
        height: 100%;
        position: relative;
        text-align: left;
      }

      .bulk-file-upload-wrapper {
        display: flex;
        align-items: center;
        height: 100%;
        width: 100%;
        justify-content: center;
      }

      :host(:not([nodrop])) {
        border: 1px dashed;
        border-color: var(--divider-color, #666);
        border-radius: 3px;
        overflow: hidden;
        padding: 30px 20px;
        background: var(--palette-pale-grey-two, #f9fbfd);
      }

      :host([dragover-valid]) {
        border-color: var(--primary-color, #00B4F0);
      }

      /*
        Cover the entire element with transparent overlay when dragging files
        over it. Helps to reduce the amount of events fired.
      */

      :host::before {
        @apply --layout-fit;
        content: '';
        display: none;
        z-index: 10;
      }

      :host([dragover])::before {
        display: block;
      }

      #dragRipple {
        color: var(--light-primary-color, #7CD8F7);
      }

      #dropLabel {
        @apply --layout-flex;
        position: relative;
        margin: 0 .29em;
        font-size: var(--font-size-xl, 20px);
        font-weight: 500;
        color: var(--default-icon-color, #8994a0);
        text-align: center;
      }

      .bulk-file-upload-list {
        overflow-x: hidden;
        padding-top: 10px;
        overflow-y: auto;
        max-height: 30vh;
      }

      :host([dragover-valid]) #dropLabel {
        color: var(--primary-color, #00B4F0);
      }
    </style>
    <div>
      <div id="buttons" class="bulk-file-upload-wrapper">
        <div id="buttonsPrimary">
          <div id="dropLabel" hidden\$="[[nodrop]]">
            <slot name="drop-label-icon">
              <pebble-icon id="dropLabelIcon" class="pebble-icon-size-30 m-b-10" icon="pebble-icon:upload-asset"></pebble-icon>
            </slot>
            <div class="clearfix"></div>
            <slot name="drop-label">
              [[_i18nPlural(maxFiles, i18n.dropFiles, i18n.dropFiles.*)]]
            </slot>
          </div>
          <div id="addFiles" on-tap="_onAddFilesClick" class="text-center">
            <slot name="add-button">
              <pebble-button id="addButton" class="btn btn-success m-t-10" button-text="[[_i18nPlural(maxFiles, i18n.addFiles, i18n.addFiles.*)]]" disabled="[[maxFilesReached]]"></pebble-button>
            </slot>
          </div>
        </div>
      </div>
      <div id="fileList" class="p-relative">
        <div class="full-height bulk-file-upload-list">
          <template is="dom-repeat" items="[[files]]" as="file">
            <pebble-bulk-file-upload-file-item file="[[file]]"></pebble-bulk-file-upload-file-item>
          </template>
        </div>
      </div>
    </div>
    <input type="file" id="fileInput" on-change="_onFileInputChange" name="[[_getUniqueName()]]" hidden="" accept\$="{{accept}}" multiple\$="[[_isMultiple(maxFiles)]]">
    <paper-ripple id="dragRipple" noink=""></paper-ripple>
`;
  }

  static get is() { return 'pebble-bulk-file-upload' }

  static get properties() {
    return {
      /**
       * Specifies whether or not the element supports files-drop on it for the file upload.
       * By default it is enabled in the desktop and disabled in the touch devices
       * as mobile devices do not support the drag events. Set it to <b>true</b> to disable the 
       * files-drop on all devices. If it is <b>false</b>, files-drop is enabled even in touch devices.
       *
       * @default true in touch-devices, false otherwise.
       */
      nodrop: {
        type: Boolean,
        reflectToAttribute: true,
        value: false
      },

      /**
       * Indicates the server URL. The default value is an empty string. The value 
       * `_window.location_` is used when it is empty string. 
       */
      target: {
        type: String,
        value: ''
      },

      /**
       * Indicates a HTTP method to send the files. The allowed values are "POST" and "PUT".
       */
      method: {
        type: String,
        value: 'POST'
      },

      /**
       * Indicates the maximum time in milliseconds for the entire upload process. If it exceeds the
       * the given `timeout` request is aborted. If the set value is "zero", it indicates there is no timeout.
       *
       */
      timeout: {
        type: Number,
        value: 0
      },

      _dragover: {
        type: Boolean,
        value: false,
        observer: '_dragoverChanged'
      },

      /**
       * Indicates the array of files that are either processed, or already uploaded.
       *
       * Each element is a [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File)
       * object with a number of extra properties  to track the upload process:
       * - `uploadTarget`: Indicates the target URL used to upload `this` file.
       * - `elapsed`: Indicates an elapsed time since the upload started.
       * - `elapsedStr`: Indicates human-readable elapsed time.
       * - `remaining`: Indicates number of seconds remaining for the upload to finish.
       * - `remainingStr`: Indicates human-readable remaining time for the upload to finish.
       * - `progress`: Indicates the percentage of the file already uploaded.
       * - `speed`: Indicates the upload speed in kilo-bytes per second.
       * - `size`: Indicates the file size in bytes.
       * - `totalStr`: Indicates the human-readable total size of the file.
       * - `loaded`: Indicates number of "bytes" transferred so far.
       * - `loadedStr`: Indicates human-readable uploaded size at the moment.
       * - `status`: Indicates the status of the upload process.
       * - `error`: Indicates an error message in case the upload is failed.
       * - `abort`: Specifies whether or not the file upload is canceled. It is set to "true", if the upload canceled.
       * - `complete`: Specifies whether or not the file is transferred to the server. It is set to "true", if the file is transferred to the server.
       * - `uploading`: Specifies whether or not the file data is getting transferred to the server. It is set to "true", if the file data is getting transferred to the server.
       */
      files: {
        type: Array,
        notify: true,
        value: function () {
          return [];
        }
      },

      /**
       * Indicates the number of files to upload. By default it is unlimited. If the value is
       * set to one, native file browser prevents selection of multiple files.
       */
      maxFiles: {
        type: Number,
        value: Infinity
      },

      /**
       * Specifies whether or not number of files uploaded reached the maximum limit set.
       */
      maxFilesReached: {
        type: Boolean,
        value: false,
        notify: true,
        readOnly: true,
        computed: '_maxFilesAdded(maxFiles, files.length)'
      },

      /**
       * Specifies the types of files that the server accepts.
       * Syntax: A comma-separated list of MIME type patterns (wildcards are
       * allowed) or file extensions.
       * Note that MIME types are widely supported while file extensions
       * are only implemented in certain browsers. Therefore, avoid using it.
       * Example: accept="video/*,image/tiff" or accept=".pdf,audio/mp3"
       */
      accept: {
        type: String,
        value: ''
      },

      /**
       * Specifies the maximum file size in bytes allowed to upload.
       * Note that it is a client-side constraint and is checked before
       * the request is sent. Do the same validation in
       * the server-side and make sure that they are aligned.
       */
      maxFileSize: {
        type: Number,
        value: Infinity
      },

      /**
       * Specifies if the `dragover` is validated with `maxFiles` and
       * accept properties.
       */
      _dragoverValid: {
        type: Boolean,
        value: false,
        observer: '_dragoverValidChanged'
      },

      /**
       * Specifies the 'name' property at `content-disposition`.
       */
      formDataName: {
        type: String,
        value: 'file'
      },

      /**
       * Prevents upload(s) from immediately uploading upon adding file(s).
       * When set, you must manually trigger the uploads using the `uploadFiles` method.
       */
      noAuto: {
        type: Boolean,
        value: false
      },
      /**
        * <b><i>Content development is under progress... </b></i> 
        */
      loadCompleteFilesCount: {
        type: Number,
        value: 0
      },

      validFilesCount: {
        type: Number,
        value: 0
      },
      /**
        * <b><i>Content development is under progress... </b></i> 
        */
      succeededFiles: {
        type: Array,
        notify: true,
        value: function () {
          return [];
        }
      },

      /**
       * Specifies whether or not the upload is "S3 upload".
       */
      s3Upload: {
        type: Boolean,
        value: false
      },

      /**
       * Indicates the object that localizes "this" component.
       * To change the default localization, either change the entire
       * "_i18n_"" object or the property you want to modify.
       *
       * The object has the following JSON structure and default values:

    {
      dropFiles: {
       one: 'Drop file here...',
       many: 'Drop files here...'
      },
      addFiles: {
       one: 'Select File',
       many: 'Upload Files'
      },
      cancel: 'Cancel',
      error: {
       tooManyFiles: 'Too Many Files.',
       fileIsTooBig: 'Failed to upload. Max allowed file size is ',
       fileIsEmpty: 'Failed to upload. File is empty.',
       incorrectFileType: 'Incorrect File Type.'
      },
      uploading: {
       status: {
         connecting: 'Connecting...',
         stalled: 'Stalled.',
         processing: 'Processing File...',
         held: 'Queued'
       },
       remainingTime: {
         prefix: 'remaining time: ',
         unknown: 'unknown remaining time'
       },
       error: {
         serverUnavailable: 'Server Unavailable',
         unexpectedServerError: 'Unexpected Server Error',
         forbidden: 'Failed to upload. Retry...'
       }
      },
      units: {
       size: ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      },
      formatSize: function(bytes) {
       // returns the size followed by the best suitable unit
      },
      formatTime: function(seconds, [secs, mins, hours]) {
       // returns a 'HH:MM:SS' string
      }
    }

       *
       * @default {English}
       */
      i18n: {
        type: Object,
        value: function () {
          return {
            dropFiles: {
              one: 'Drag & Drop files here',
              many: 'Drag & Drop files here'
            },
            addFiles: {
              one: 'Upload File',
              many: 'Upload Files'
            },
            cancel: 'Cancel',
            error: {
              tooManyFiles: 'Too Many Files.',
              fileIsTooBig: 'Failed to upload. Max allowed file size is ',
              fileIsEmpty: 'Failed to upload. File is empty.',
              incorrectFileType: 'Incorrect File Type.'
            },
            uploading: {
              status: {
                connecting: 'Connecting...',
                stalled: 'Stalled.',
                processing: 'Uploading File...',
                held: 'Queued'
              },
              remainingTime: {
                prefix: 'remaining time: ',
                unknown: 'unknown remaining time'
              },
              error: {
                serverUnavailable: 'Server Unavailable',
                unexpectedServerError: 'Unexpected Server Error',
                forbidden: 'Failed to upload. Retry...'
              }
            },
            units: {
              size: ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            }
          };
        }
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("dragover", this._onDragover);
    this.removeEventListener("dragleave", this._onDragleave);
    this.removeEventListener("drop", this._onDrop);
    this.removeEventListener("file-retry", this._onFileRetry);
    this.removeEventListener("file-abort", this._onFileAbort);
    this.removeEventListener("file-remove", this._onFileRemove);
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("dragover", this._onDragover);
    this.addEventListener("dragleave", this._onDragleave);
    this.addEventListener("drop", this._onDrop);
    this.addEventListener("file-retry", this._onFileRetry);
    this.addEventListener("file-abort", this._onFileAbort);
    this.addEventListener("file-remove", this._onFileRemove);
  }




  _formatSize(bytes) {
    if (typeof this.i18n.formatSize === 'function') {
      return this.i18n.formatSize(bytes);
    }

    // https://wiki.ubuntu.com/UnitsPolicy
    let base = this.i18n.units.sizeBase || 1000;
    let unit = ~~(Math.log(bytes) / Math.log(base));
    let dec = Math.max(0, Math.min(3, unit - 1));
    let size = parseFloat((bytes / Math.pow(base, unit)).toFixed(dec));
    return size + ' ' + this.i18n.units.size[unit];
  }

  _splitTimeByUnits(time) {
    let unitSizes = [60, 60, 24, Infinity];
    let timeValues = [0];

    for (let i = 0; i < unitSizes.length && time > 0; i++) {
      timeValues[i] = time % unitSizes[i];
      time = Math.floor(time / unitSizes[i]);
    }

    return timeValues;
  }

  _formatTime(seconds, split) {
    if (typeof this.i18n.formatTime === 'function') {
      return this.i18n.formatTime(seconds, split);
    }

    // Fill HH:MM:SS with leading zeros
    while (split.length < 3) {
      split.push(0);
    }

    return split
      .reverse()
      .map(function (number) {
        return (number < 10 ? '0' : '') + number;
      })
      .join(':');
  }

  _formatFileProgress(file) {
    return file.totalStr + ': ' +
      file.progress + '% (' +
      (file.loaded > 0 ?
        this.i18n.uploading.remainingTime.prefix + file.remainingStr :
        this.i18n.uploading.remainingTime.unknown) +
      ')';
  }

  _maxFilesAdded(maxFiles, numFiles) {
    return maxFiles >= 0 && numFiles > maxFiles;
  }

  _dragRippleAction(action, event) {
    let rippleActionEvent = {
      detail: {
        x: event.clientX,
        y: event.clientY
      }
    };

    if (action == 'down') {
      this.$.dragRipple.downAction(rippleActionEvent);

      // paper-ripple currently has hard Ripple.MAX_RADIUS limit of 300, and
      // doesn’t expose Ripple constructor or any other means to modify the
      // limit. Monkey-patching the radius calculation of just added Ripple
      // instance to disable the radius limit.
      //
      // Also fixes the default radius animation formula, which otherwise
      // tends to make the duration too small for large ripples that we have.
      //
      // See:
      // - https://github.com/PolymerElements/paper-ripple/issues/27
      // - https://github.com/PolymerElements/paper-ripple/pull/63
      //
      let lastRipple = this.$.dragRipple.ripples[this.$.dragRipple.ripples.length - 1];
      if (!lastRipple.hasOwnProperty('radius')) {
        Object.defineProperty(lastRipple, 'radius', {
          get: function () {
            let width2 = this.containerMetrics.width * this.containerMetrics.width;
            let height2 = this.containerMetrics.height * this.containerMetrics.height;
            let waveRadius = Math.sqrt(width2 + height2) * 1.1 + 5;

            let duration = 0.9 + 0.2 * (waveRadius / 300);
            let timeNow = this.mouseInteractionSeconds / duration;
            let size = waveRadius * (1 - Math.pow(80, -timeNow));
            return Math.abs(size);
          }
        });
      }
    } else {
      this.$.dragRipple.upAction(rippleActionEvent);
    }
  }

  _onDragover(event) {
    event.preventDefault();
    if (!this.nodrop && !this._dragover) {
      this._dragoverValid = !this.maxFilesReached;
      if (this._dragoverValid) {
        this._dragRippleAction('down', event);
      }
      this._dragover = true;
    }
    event.dataTransfer.dropEffect = !this._dragoverValid || this.nodrop ? 'none' : 'copy';
  }

  _onDragleave(event) {
    // Dragleave sometimes fired on children, skipping them. Fixes flickeing
    // when quickly dragging over.
    if (event.composedPath()[0] === this) {
      event.preventDefault();
      if (this._dragover && !this.nodrop) {
        this._dragRippleAction('up', event);
        this._dragover = this._dragoverValid = false;
      }
    }
  }

  _onDrop(event) {
    if (!this.nodrop) {
      event.preventDefault();
      this._dragRippleAction('up', event);
      this._dragover = this._dragoverValid = false;
      this._dragRippleAction('upAction', event);
      this._addFiles(event.dataTransfer.files);
    }
  }

  // Override for tests
  _createXhr() {
    return new XMLHttpRequest();
  }

  _configureXhr(xhr, headers) {
    xhr.responseType = 'json';

    if (typeof headers == 'string') {
      try {
        headers = JSON.parse(headers);
      } catch (e) {
        headers = undefined;
      }
    }

    for (let key in headers) {
      xhr.setRequestHeader(key, headers[key]);
    }

    if (this.timeout) {
      xhr.timeout = this.timeout;
    }
  }

  _setStatus(file, total, loaded, elapsed) {
    file.elapsed = elapsed;
    file.elapsedStr = this._formatTime(file.elapsed, this._splitTimeByUnits(file.elapsed));
    file.remaining = Math.ceil(elapsed * (total / loaded - 1));
    file.remainingStr = this._formatTime(file.remaining, this._splitTimeByUnits(file.remaining));
    file.speed = ~~(total / elapsed / 1024);
    file.totalStr = this._formatSize(total);
    file.loadedStr = this._formatSize(loaded);
    file.status = this._formatFileProgress(file);
  }

  /**
   * Can be used to trigger the upload of any files that are not completed.
   *
   * @param {Array} [files] - Files being uploaded. Defaults to all outstanding files
   */
  uploadFiles(files) {
    // files = files || this.files;
    // files = files.filter(function(file) {
    //   return !file.complete;
    // });
    Array.prototype.forEach.call(files, this._uploadFile.bind(this));
  }

  _uploadFile(file) {
    if (file.uploading) {
      return;
    }

    let ini = Date.now();
    let xhr = file.xhr = this._createXhr(file);

    let stalledId, last;
    // onprogress is called always after onreadystatechange
    xhr.upload.onprogress = function (e) {
      clearTimeout(stalledId);

      last = Date.now();
      let elapsed = (last - ini) / 1000;
      let loaded = e.loaded, total = e.total, progress = ~~(loaded / total * 100);

      file.loaded = loaded;
      file.progress = progress;
      file.indeterminate = loaded <= 0 || loaded >= total;

      if (file.error) {
        file.indeterminate = file.status = undefined;
      } else if (!file.abort) {
        if (progress < 100) {
          this._setStatus(file, total, loaded, elapsed, progress);
          stalledId = setTimeout(function () {
            file.status = this.i18n.uploading.status.stalled;
            this._notifyFileChanges(file);
          }.bind(this), 2000);
        } else {
          file.loadedStr = file.totalStr;
          file.status = this.i18n.uploading.status.processing;
          file.uploading = false;
        }
      }

      this._notifyFileChanges(file);
      this.dispatchEvent(new CustomEvent('upload-progress', { detail: { file: file, xhr: xhr }, bubbles: true, composed: true }));
    }.bind(this);

    // More reliable than xhr.onload
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        this.loadCompleteFilesCount += 1;
        clearTimeout(stalledId);
        file.indeterminate = file.uploading = false;
        if (file.abort) {
          this._notifyFileChanges(file);
          return;
        }
        file.status = '';
        // Custom listener can modify the default behavior either
        // preventing default, changing the xhr, or setting the file error
        let evt = this.dispatchEvent(new CustomEvent('upload-response', { detail: { file: file, xhr: xhr }, cancelable: true, bubbles: true, composed: true }));
        if (evt.defaultPrevented) {
          return;
        }
        if (xhr.status === 0) {
          file.error = this.i18n.uploading.error.serverUnavailable;
        } else if (xhr.status >= 500) {
          file.error = this.i18n.uploading.error.unexpectedServerError;
        } else if (xhr.status >= 400) {
          file.error = this.i18n.uploading.error.forbidden;
        }

        file.complete = !file.error;
        this.dispatchEvent(new CustomEvent('upload-' + (file.error ? 'error' : 'success'), { detail: { file: file, xhr: xhr }, bubbles: true, composed: true }));
        this._notifyFileChanges(file);

        if (file.complete) {
          let actualFileName = file.name;

          if (this.s3Upload) {
            actualFileName = file.s3ObjectKey;
          }
          else if (xhr.response && xhr.response.fileName) {
            actualFileName = xhr.response.fileName;
          }

          let fileData = {
            "originalFileName": file.name,
            "fileName": actualFileName
          };

          this.succeededFiles.push(fileData);
        }

        if (this.validFilesCount == this.loadCompleteFilesCount) {
          let eventData = this.succeededFiles;

          ComponentHelper.fireBedrockEvent("pebble-bulk-file-upload-success", eventData, { ignoreId: true });
          this.set('complete', true);
          this.set('progress', 100);
        }
      }
    }.bind(this);

    let formData = new FormData();

    if (!file.uploadTarget || _.isEmpty(file.uploadTarget)) {
      file.uploadTarget = this.target.replace('<name>', file.name);
    }

    file.formDataName = this.formDataName;
    let evt = this.dispatchEvent(new CustomEvent('upload-before', { detail: { file: file, xhr: xhr }, cancelable: true, bubbles: true, composed: true }));
    if (evt.defaultPrevented) {
      return;
    }

    formData.append(file.formDataName, file, file.name);

    xhr.open(this.method, file.uploadTarget, true);
    this._configureXhr(xhr, file.headers);
    xhr.setRequestHeader("Content-disposition", "attachment;filename=\"" + file.name + "\"");

    file.status = this.i18n.uploading.status.connecting;
    file.uploading = file.indeterminate = true;
    file.complete = file.abort = file.error = false;

    xhr.upload.onloadstart = function () {
      this.dispatchEvent(new CustomEvent('upload-start', { detail: { file: file, xhr: xhr }, bubbles: true, composed: true }));
      this._notifyFileChanges(file);
    }.bind(this);

    // Custom listener could modify the xhr just before sending it
    // preventing default
    evt = this.dispatchEvent(new CustomEvent('upload-request', { detail: { file: file, xhr: xhr, formData: formData }, cancelable: true, bubbles: true, composed: true }));
    if (!evt.defaultPrevented) {
      //Uploaded file in S3 is getting corrupted when sent through form-data...
      //S3 is expeting without form-data.
      //Whereas express file upload is failing without form-data.
      //Hence doing a S3 upload check and sending content appropriately
      if (this.s3Upload) {
        xhr.send(file);
      }
      else {
        xhr.send(formData);
      }
    }
  }

  _retryFileUpload(file) {
    let evt = this.dispatchEvent(new CustomEvent('upload-retry', { detail: { file: file, xhr: file.xhr }, cancelable: true, bubbles: true, composed: true }));
    if (!evt.defaultPrevented) {
      microTask.run(() => {
        this._uploadFile(file)
      });
    }
  }

  _abortFileUpload(file) {
    let evt = this.dispatchEvent(new CustomEvent('upload-abort', { detail: { file: file, xhr: file.xhr }, cancelable: true, bubbles: true, composed: true }));
    if (!evt.defaultPrevented) {
      file.abort = true;
      if (file.xhr) {
        file.xhr.abort();
      }
      this._notifyFileChanges(file);
    }
  }

  _notifyFileChanges(file) {
    let p = 'files.' + this.files.indexOf(file) + '.';
    for (let i = 0; i < file.length; i++) {
      if (file.hasOwnProperty(i)) {
        this.notifyPath(p + i, file[i]);
      }
    }
  }

  _addFiles(files) {
    let totalFiles = this.files.length + files.length;
    if (this._maxFilesAdded(this.maxFiles, totalFiles)) {
      let eventData = "Failed to upload. Max files allowed is 350.";

      ComponentHelper.fireBedrockEvent("pebble-bulk-file-upload-failed", eventData, { ignoreId: true });
      this.set('complete', true);
      this.set('progress', 100);
      return;
    }

    Array.prototype.forEach.call(files, this._addFile.bind(this));

    if (this.s3Upload) {
      ComponentHelper.fireBedrockEvent("pebble-bulk-file-upload-started", files, { ignoreId: true });

      this.set('complete', true);
      this.set('progress', 100);
    }
  }

  /**
   * Add the file for uploading. Called internally for each file after picking files from dialog or dropping files.
   *
   * @param {File} file File being added
   */
  _addFile(file) {
    let fileExt = file.name.match(/\.[^\.]*$|$/)[0];
    let re = new RegExp('^(' + this.accept.replace(/[, ]+/g, '|').replace(/\/\*/g, '/.*') + ')$', 'i');
    if (this.accept && !(re.test(file.type) || re.test(fileExt))) {
      this.dispatchEvent(new CustomEvent('file-reject', { detail: { file: file, error: this.i18n.error.incorrectFileType }, bubbles: true, composed: true }));
      return;
    }

    if (file.size <= 0) {
      file.error = this.i18n.error.fileIsEmpty;
    }
    else if (this.maxFileSize >= 0 && file.size > this.maxFileSize) {
      file.error = this.i18n.error.fileIsTooBig + this._formatSize(this.maxFileSize);
    }
    else {
      this.validFilesCount += 1;
      file.status = this.i18n.uploading.status.held;
    }

    file.loaded = 0;
    this.unshift('files', file);
    if (!this.noAuto && !file.error) {
      this._uploadFile(file);
    }
  }

  /**
   * Remove file from upload list. Called internally if file upload was canceled.
   * @param {File} file File to remove
   */
  _removeFile(file) {
    this.splice('files', this.files.indexOf(file), 1);
  }

  _onAddFilesClick() {
    if (resetMouseCanceller) {
      /*
        With Polymer v1.7.1, the ghost-click prevention cancels the synthetic
        file input click in iOS Safari. This prevents the cancelling.

        See also: https://github.com/Polymer/polymer/issues/4242
      */
      resetMouseCanceller();
    }

    this.$.fileInput.value = '';
    this.$.fileInput.click();
  }

  _onFileInputChange(event) {
    this._addFiles(event.target.files);
  }

  _onFileRetry(event) {
    this._retryFileUpload(event.detail.file);
  }

  _onFileAbort(event) {
    this._abortFileUpload(event.detail.file);
  }

  _onFileRemove(event) {
    event.stopPropagation();
    this._removeFile(event.detail.file);
  }

  _dragoverChanged(dragover) {
    this.toggleAttribute('dragover', dragover);
  }

  _dragoverValidChanged(dragoverValid) {
    this.toggleAttribute('dragover-valid', dragoverValid);
  }

  _i18nPlural(value, plural) {
    return value == 1 ? plural.one : plural.many;
  }

  _isMultiple() {
    return this.maxFiles != 1;
  }
  /**
    * <b><i>Content development is under progress... </b></i> 
    */
  reset() {
    for (let key in this.files) {
      let file = this.files[key];
      file.abort = true;
      if (file.xhr) {
        file.xhr.abort();
      }
    }

    this.files = [];
    this.succeededFiles = [];
    this.loadCompleteFilesCount = 0;
    this.validFilesCount = 0;

    this.set('error', false);
    this.set('complete', false);
    this.set('progress', 0);
  }
  _getUniqueName(){
    let uid = DataHelper.getParamValue("uid");
    if(uid){
      return "user_" + uid;
    }
  }
}
customElements.define(PebbleBulkFileUpload.is, PebbleBulkFileUpload)
