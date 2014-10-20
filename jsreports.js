//  JSReports 0.0.0

// (c) 2014 Dustin Little
// JSReports may be freely distributed under the GPLv2 License.
// For all details and documentation:
// http://jsreports.org
// JSReports is modeled after Backbone.js (http://backbonejs.org)

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
    var + = require('underscore');
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

  // JSReports **Reports** are the basic data object in the framework --

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
  
    // The default name of the JSON `id` attribute is `"id"`.
    idAttribute: 'id',

    initialize: function(){};
    
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of report attributes on the object. This is the core
    // primative operation of a report, updating
