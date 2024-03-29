import '@polymer/polymer/polymer-legacy.js';
import { Templatizer } from '@polymer/polymer/lib/legacy/templatizer-behavior.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
let saulis = window.saulis || {};

/** @polymerBehavior saulis.DataTableTemplatizerBehavior */
saulis.DataTableTemplatizerBehaviorImpl = {
  properties: {
    expanded: {
      type: Boolean
    },
    index: {
      type: Number
    },
    item: {
      type: Object
    },
    selected: {
      type: Boolean
    },
    table: {
      type: Object
    },
    template: {
      type: Object
    },

    //singleton
    _instances: {
      type: Array,
      value: function () {
        return []
      }
    },

    //singleton
    _forwardedParentProps: {
      type: Object,
      value: {}
    },

    _instance: {
      type: Object,
      computed: '_templatize(template)'
    },

    _instanceProps: {
      type: Object
    }

  },

  observers: [
    '_expandedChanged(_instance, expanded)',
    '_indexChanged(_instance, index)',
    '_itemChanged(_instance, item)',
    '_itemPathChanged(_instance, item.*)',
    '_selectedChanged(_instance, selected)'
  ],

  created: function () {
    this._instanceProps = {
      column: true,
      expanded: true,
      index: true,
      item: true,
      selected: true
    };
  },

  _templatize: function (template) {
    let instance = undefined;
    if (!this.template._templatized) {
      this.template._templatized = true;
      this.templatize(template);

      // fix _rootDataHost to the context where template has been defined
      if (template._rootDataHost) {
        this._getRootDataHost = function () {
          return template._rootDataHost;
        };
      }

      instance = this.stamp({});
    } else {
      instance = new this.template.__templatizeOwner.ctor({})
    }
    // initializing new template instance with previously forwarded parent props.
    // could be done with observers, but this is simpler.
    for (let key in this._forwardedParentProps) {
      instance[key] = this._forwardedParentProps[key];
    }
    this._instances.push(instance);

    dom(this).insertBefore(instance.root, dom(this).firstElementChild);

    return instance;


  },

  _expandedChanged: function (instance, expanded) {
    // store original expanded value to detect when value change has
    // originated from within the template.
    if (!(instance === undefined || expanded === undefined)) {
      this._expanded = expanded;

      instance.expanded = expanded;
    }
  },

  _indexChanged: function (instance, index) {
    if (!(instance === undefined || index === undefined)) {
      instance.index = index;
    }
  },

  _itemChanged: function (instance, item) {
    if (!(instance === undefined || item === undefined)) {
      instance.item = item;
    }
  },

  _itemPathChanged: function (instance, item) {
    // TODO: hack to avoid: https://github.com/Polymer/polymer/issues/3307
    if (!(instance === undefined || item === undefined)) {
      this._parentProps = this._parentProps || {};

      instance.notifyPath(item.path, item.value);
    }
  },

  _selectedChanged: function (instance, selected) {
    // store original selected value to detect when value change has
    // originated from within the template.
    if (!(instance === undefined || selected === undefined)) {
      this._selected = selected;

      instance.selected = selected;
    }
  },

  /** templatizer */
  _forwardParentProp: function (prop, value) {
    // store props to initialize new instances.
    this._forwardedParentProps[prop] = value;

    //TODO: Bug in Polymer, seems to two-way bind any parent property only
    //to the last template instance created. We need to push the property
    //to all instances manually.
    this._instances.forEach(function (inst) {
      inst[prop] = value;
    });
  },

  _forwardInstanceProp: function (inst, prop, value) {
    if (prop === 'expanded' && inst.item && this._expanded !== value) {
      if (value) {
        this.table.expandItem(inst.item);
      } else {
        this.table.collapseItem(inst.item);
      }
    }

    if (prop === 'selected' && inst.item && this._selected !== value) {
      if (value) {
        this.table.selectItem(inst.item);
      } else {
        this.table.deselectItem(inst.item);
      }
    }
  },

  _forwardInstancePath: function (inst, path, value) {
    if (path.indexOf('item') === 0) {
      // instance.notifyPath above will call _forwardInstancePath recursively,
      // so need to debounce to avoid firing the same event multiple times.
      this.table.debounce('item-changed', function () {
        // stripping 'item.' from path.
        this.table.fire('item-changed', {
          item: inst.item,
          path: path.substring(5),
          value: value
        });
      }.bind(this));
    }
  }
};

/** @polymerBehavior */
saulis.DataTableTemplatizerBehavior = [Templatizer, saulis.DataTableTemplatizerBehaviorImpl];

export default saulis