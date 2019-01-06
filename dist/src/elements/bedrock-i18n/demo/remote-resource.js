import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-demo-helpers/demo-pages-shared-styles.js';
import '@polymer/iron-demo-helpers/demo-snippet.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '../bedrock-i18n.js';
import '../../pebble-textbox/pebble-textbox.js';
import './common-styles.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: html`
		<style include="common-styles">/* */</style>

		<div class="lang">
			<span title="english">🇬🇧 EN</span>
			<paper-toggle-button on-change="_toggle" id="switch"></paper-toggle-button>
			<span title="french">FR 🇫🇷</span>
		</div>

		<h4>{{localize('header_1')}}</h4>
		<div class="snippet">
			<div class="demo">
				<div>{{localize('greeting')}}</div>
				<div>{{localize('missing')}}</div>
				<div>{{localize('intro', 'name', 'Batman')}}</div>
				<div>{{localize('cats', 'numCats', 10000, 'pctBlack', 0.42)}}</div>
				<div>{{localize('sale', 'start', 150, 'time', 15, 'price', 10)}}</div>
			</div>
			<div class="code">
				<code>localize('greeting')</code>
				<code>localize('intro', 'name', 'Batman')</code>
				<code>localize('cats', 'numCats', 10000, 'pctBlack', 0.42)</code>
				<!-- Dates need to be a valid JavaScript object. For an example, we
          are passing a number of milliseconds from the epoch -->
				<code>localize('sale', 'start', 150, 'time', 15, 'price', 10)</code>
			</div>
		</div>

		<h4>{{localize('header_2')}}</h4>
		<div class="snippet">
			<div class="demo">
				<div>{{localize('fruit', 'num', 0)}} / {{localize('fruit', 'num', 1)}}/ {{localize('fruit', 'num', 3)}}</div>
				<div>{{localize('bananas', 'name', 'Robin', 'gender', 'male', 'num', 1)}}</div>
				<div>{{localize('bananas', 'name', 'Robin', 'gender', 'female', 'num', 0)}}</div>
				<div>{{localize('bananas', 'name', 'Robin', 'gender', 'other', 'num', 4)}}</div>
			</div>
			<div class="code">
				<code>localize('fruit', 'num', 0) / localize('fruit', 'num', 1) / localize('fruit', 'num', 3)</code>
				<code>localize('bananas', 'name', 'Robin', 'gender', 'male', 'num', 1)</code>
				<code>localize('bananas', 'name', 'Robin', 'gender', 'female', 'num', 0)</code>
				<code>localize('bananas', 'name', 'Robin', 'gender', 'other', 'num', 4)</code>
			</div>
		</div>
		<h4>{{localize('header_3')}}</h4>
		<demo-snippet>
			<pebble-textbox label="{{localize('greeting')}}"></pebble-textbox>
		</demo-snippet>
`,

  is: "remote-resource",

  behaviors: [
   RUFBehaviors.Internationalization
 ],

  properties: {
    /* Overriden from Internationalization behavior */
    formats: {
      type: Object,
      value: function() {
        return {
          number: { USD: { style: 'currency', currency: 'USD' } }
        };
      }
    }
  },

  _toggle: function() {
    this.language = this.$.switch.checked ? 'fr' : 'en';
  }
});
