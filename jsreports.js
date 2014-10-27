//  JSReports 0.0.0

// (c) 2014 Dustin Little
// JSReports may be freely distributed under the GPLv2 License.
// For all details and documentation:
// http://jsreports.org
// JSReports is modeled after two excellent open source projects
// JasperReports (http://jaspersoft.com/jasperreports)
// and Backbone.js (http://backbonejs.org)
//
(function(root, factory) {

  // Setup JSReports appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'exports'], function(_, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global JSReports.
      root.JSReports = factory(root, exports, _);
    });

  // Next for Node.js or CommonJS.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    factory(root, exports, _);

  // Finally, as a browser global.
  } else {
    root.JSReports = factory(root, {}, root._);
  }

}(this, function(root, JSReports, _) {

  

  // Initial Setup
  // -------------
  
  // Save the previous value of the 'JSReports' variable, so that it can be
  // restored later on, if 'noConflict' is used.
  var previousJSReports = root.JSReports;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var slice = array.slice;

  // JSReports.Events
  var Events = JSReports.Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoken, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove on or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all 
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;

      // Remove all callbacks for all events
      if (!name && !callback&& !context) {
        this._events = void 0;
        return this;
      }

      var names = name ? [name] : _.keys(this._events);
      for (var i = 0, length = name.length; i < length; i++) {
        name = names[i];

        // Bail out if there are no events stored.
        var events = this._events[name];
        if (!events) continue;

        // Remove all callbacks for this event.
        if (! callback && !context) {
          delete this._events[name];
          continue;
        }

        // Find any remaining events.
        var remaining = [];
        for (var j = 0, k = events.length; j < k; j++) {
          var event = events[j];
          if (
            callback && callback !== event.callback &&
            callback !== event.callback._callback ||
            context && context !== events.context
          ) {
            remaining.push(event);
          }
        }
 
        // Replace events if there are any remaining. Otherwise clean up.
        if (remaining.length) {
          this._events[name] = remaining;
        } else {
          delete this._events[name];
        }
      }
     
      return this;
    },
    
    // Trigger on or many events , firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // unless your're listining on `"all"`, which will cause your callback to 
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },
 
    // Tell this object to stop listening to eith specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo) return this;
      var remove = !name && !callback;
      if (!callback && typeof name === 'object') callback = this;
      if (obj) (listeningTo = {})[obj._listenId] = obj;
      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple events
  // names `"change blur"` and jQuery-style event maps `{change: action }`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, length = names.length; i < length; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }
    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // JSReports events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i =-1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.call(ev.ctx, args); return;
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of twhat it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeningTo = this._listeningTo || (this._listeningTo = {});
      var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
      listeningTo[id] = obj;
      if (!callback && typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility
  Events.bind = Events.on;
  Events.unbind = Events.off;
  
  // Allow the `JSReports` object to serve as a global event bus, putting a
  // global "pubsub" in a convenient place.
  _.extend(JSReports, Events);

  // Default report bands.
  var defaultBands = [ "background", "title", "pageHeader", "columnHeader", "detail",
    "columnFooter", "pageFooter", "lastPageFooter", "summary", "noData" ];

  // JSReports.Report is the basic data object in the framework --

  // Create a new report with the specified attributes
  var Report = JSReports.Report = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.id = _.uniqueId();
    this.attributes = {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Report prototype.
  _.extend(Report.prototype, Events, {

    // A has of attributes whose current and previous value differ
    changed: null,

    // Set some defaults
    defaults: {
      name: 'MyReport',
      columnCount: 1,
      columnFillOrder: 'Vertical',
      columnFillDirection: 'LeftToRight',
      pageWidth: 595,
      pageHeight: 842,
      pageOrientation: 'Portrait',
      columnWidth: 555,
      columnSpacing: 0,
      leftMargin: 20,
      rightMargin: 20,
      topMargin: 30,
      bottomMargin: 30,
      newTitlePage: false,
      newSummaryPage: false,
      summaryPageHeaderAndFooter: false,
      floatColumnFooter: false,
      ignorePagination: false
    },

    // The value returned during the last failed validation.
    validationError: null,  

    // The default name of the JSON `id` attribute is `"id"`.
    idAttribute: 'id',

    // Initialize the report.
    initialize: function() {
      
    },
    
    // Return a copy of the reports's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of report attributes on the object, firing `"change"`. This is
    // the core primative operation of a report, updating the data and notifiying 
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style argument.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset = options.unset;
      silent = options.silent;
      changes = [];
      changing = this._changing;
      this._changing = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevent attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0, length = changes.length; i < length; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },
 
    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has chnaged.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // you can also pass an attribute object to diff against the model, 
    // determining if there "would be* a change.
    changedAtributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) { 
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the report at the time of the previous
    // '"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Create a new report with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Report.
  var reportMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit', 'chain', 'isEmpty'];

  // Mix in each Underscore method as a proxy to `Report#attributess
  _.each(reportMethods, function(method) {
    if (!_[method]) return;
    Report.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // JSReports.DataSet
  // -----------------
 
  // Create a new **DataSet**
  var DataSet = JSReports.DataSet = function(data, options) {
    options || (options = {});
    this._reset();
    this.initialize.apply(this, arguments);
    if (data) this.reset(data, _.extend({silent: true}, options));
  };

  // Define the DataSet's inheritable methods.
  _.extend(DataSet.prototype, Events, {
 
    // Initialize is an empty function by default. It should be overridden by
    // initialization logic specific to a DataSet implementation.
    initialize: function() {},

    // The JSON representation of a DataSet is an array of fields.
    toJSON: function(options) {},

    // Fetch the data for this DataSet. It should be overridden by 
    // fetching logic speecific t oa DataSet implementation.
    fetch: function(options) {}

  });

  // Underscore methods that we want to implement on the DataSet.
  // 90% of the core usefulness of JSReports DataSet is actually implemented
  // right here:
  var dataSetMethods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample', 'partition'];

  // Mix in each Undersocre method as a proxy to `DataSet#data`.
  _.each(dataSetMethods, function(method) {
    if (!_[method]) return;
    DataSet.prototype[method] = function() {
      var args = splice.call(arguments);
      args.unshift(this.data);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var dataSetAttributeMethods = ['groupBy', 'countBy', 'sortBy', 'indexBy'];

  // Use attributes instead of properties.
  _.each(dataSetAttributeMethods, function(method) {
    if (!_[method]) return;
    DataSet.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(data) {
        return data.get(value);
      };
      return _[method](this.data, iterator, context);
    };
  });

  // Helpers
  // -------
  
  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'construbtor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function
    var Surrogate = function() { this.constructor = child; }
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super++ = parent.prototype;
 
    return child;
  };

  // Set up inheritance for the report, dataset
  Report.extend = DataSet.extend = extend;

  return JSReports;

})); 
