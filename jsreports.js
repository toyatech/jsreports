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
    define(['underscore', 'backbone', 'exports'], function(_, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global JSReports.
      root.JSReports = factory(root, exports, _, Backbone);
    });

  // Next for Node.js or CommonJS.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore')
      , Backbone = require('backbone');
    factory(root, exports, _, Backbone);

  // Finally, as a browser global.
  } else {
    root.JSReports = factory(root, {}, root._, root.Backbone);
  }

}(this, function(root, JSReports, _, Backbone) {

  

  // Initial Setup
  // -------------
  
  // Save the previous value of the 'JSReports' variable, so that it can be
  // restored later on, if 'noConflict' is used.
  var previousJSReports = root.JSReports;

  // Helpers
  // -------

  // Calculation types used to compute variables
  var calculations = {
    'None': function() {},
    'Count': function() {},
    'DistinctCount': function() {},
    'Sum': function() {},
    'Average': function() {},
    'Lowest': function() {},
    'Highest': function() {},
    'StandardDeviation': function() {},
    'Variance': function() {},
    'Custom': function() {},
    'First': function() {}
  }

  // JSReports.ReportElement is the basic data object in the framework --

  // Create a new reportElement with the specified attributes
  var ReportElement = JSReports.ReportElement = Backbone.Model.extend({});

  // Default report bands.
  var defaultBands = [ "background", "title", "pageHeader", "columnHeader", 
    "detail", "columnFooter", "pageFooter", "lastPageFooter", "summary", 
    "noData" ];
  
  // JSReports.Report is the basic data object in the framework --
  // Create a new report with the specified attributes
  var Report = JSReports.Report = ReportElement.extend({ 

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
    }

  });

  // JSReports.Row
  // -------------

  // Create a new **Row**
  var Row = JSReports.Row = Backbone.Model.extend();

  // JSReports.DataSet
  // -----------------
 
  // Create a new **DataSet**
  var DataSet = JSReports.DataSet = Backbone.Collection.extend({
    model: Row
  });

  return JSReports;

})); 
