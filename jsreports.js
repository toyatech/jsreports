//  JSReports 0.0.0

// (c) 2014 Dustin Little
// JSReports may be freely distributed under the GPLv2 License.
// For all details and documentation:
// http://jsreports.org
// JSReports is modeled after the excellent open source reporting library
// JasperReports (http://jaspersoft.com/jasperreports)
//
(function(root, factory) {

  // Setup JSReports appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['exports'], function(exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global JSReports.
      root.JSReports = factory(root, exports);
    });

  // Next for Node.js or CommonJS.
  } else if (typeof exports !== 'undefined') {
    factory(root, exports);

  // Finally, as a browser global.
  } else {
    root.JSReports = factory(root, {});
  }

}(this, function(root, JSReports) { 

  function $F(field) {
  }

  function $V(variable) {
  }

  function $P(parameter) {
  }

  function evaluateExpression(expression, context) {
    return function() { return eval(expression); }.call(context);
  }

  function defaults(v, d, t) {
    if (Array.isArray(d)) {
      if (Array.isArray(v)) {
        var a = [];
        for (var i = 0; i < v.length; i++) {
           a.push(new t(v[i]));
        }
        return a;
      } else { 
        return d; 
      }
    } else if (typeof(t) === 'object') {
      var a = [];
      for (var k in t) {
        a.push(t[k]);
      }
      return a.indexOf(v) > -1 ? v : t[d];
    } else {
      console.log(typeof(v));
      if (typeof(v) === 'undefined') d = undefined;
      return typeof(v) === typeof(d) ? v : d;
    }
  }

  function required(v, k) {
    if (v) {
      return v;
    } else {
      throw new Error(k + ' is require!');
    }
  }

  var Report = function(reportDesc, options) {
    this.reportDesc = reportDesc;
    this.options = options || {};

    this.name = required(reportDesc.name, 'name');
    this.columnCount = defaults(reportDesc.columnCount, 1);
    this.printOrder = defaults(reportDesc.printOrder, 'VERTICAL', PrintOrder);
    this.columnDirection = defaults(reportDesc.columnDirection, 'LEFT_TO_RIGHT', ColumnDirection);
    this.pageWidth = defaults(reportDesc.pageWidth, 595);
    this.pageHeight = defaults(reportDesc.pageHeight, 842);
    this.orientation = defaults(reportDesc.orientation, 'PORTRAIT', Orientation);
    this.noDataAction = defaults(reportDesc.noDataAction, 'NO_PAGES', NoDataAction);
    this.columnWidth = defaults(reportDesc.columnWidth, 555);
    this.columnSpacing = defaults(reportDesc.columnSpacing, 0);
    this.leftMargin = defaults(reportDesc.leftMargin, 20);
    this.rightMargin = defaults(reportDesc.rightMargin, 20);
    this.topMargin = defaults(reportDesc.topMargin, 30);
    this.bottomMargin = defaults(reportDesc.bottomMargin, 30);
    this.titleOnNewPage = defaults(reportDesc.titleOnNewPage, false);
    this.summaryOnNewPage = defaults(reportDesc.summaryOnNewPage, false);
    this.summaryWithPageHeaderAndFooter = defaults(reportDesc.summaryWithPageHeaderAndFooter, false);
    this.floatColumnFooter = defaults(reportDesc.floatColumnFooter, false);
    this.ignorePagination = defaults(reportDesc.ignorePagination, false);
    
    this.styles = defaults(reportDesc.styles, [], Style);
    this.properties = defaults(reportDesc.properties, [], Property);
    this.parameters = defaults(reportDesc.parameters, [], Parameter);
    this.fields = defaults(reportDesc.fields, [], Field);
    this.variables = defaults(reportDesc.variables, [], Variable);
    this.groups = defaults(reportDesc.groups, [], Group);
    this.title = reportDesc.title || {};
    this.pageHeader = reportDesc.pageHeader || {};
    this.columnHeader = reportDesc.columnHeader || {};
    this.detail = reportDesc.detail || {};
    this.columnFooter = reportDesc.columnFooter || {};
    this.pageFooter = reportDesc.pageFooter || {};
    this.summary = reportDesc.summary || {};
  }

  var Property = Report.Property = function(propertyDesc) {
    this.name = required(propertyDesc.name, 'name');
    this.value = propertyDesc.value;
  }

  var Parameter = Report.Parameter = function(parameterDesc) {
    this.name = required(parameterDesc.name, 'name');
    this.type = defaults(parameterDesc.type, 'String');
    //this.description = defaults(parameterDesc.description, '');
  }

  var Field = Report.Field = function(fieldDesc) {
  }

  var Variable = Report.Variable = function(variableDesc) {
  }
  
  var Group = Report.Group = function(groupDesc) {
  }

  var Band = Report.Band = function(bandDesc) {
  }

  var Style = Report.Style = function(styleDesc) {
  }

  var PrintOrder = Report.PrintOrder = {
    VERTICAL: 'Vertical',
    HORIZONTAL: 'Horizontal'
  }
  
  var ColumnDirection = Report.ColumnDirection = {
    LEFT_TO_RIGHT: 'LeftToRight',
    RIGHT_TO_LEFT: 'RightToLeft'
  }

  var Orientation = Report.Orientation = {
    PORTRAIT: 'Portrait',
    LANDSCAPE: 'Landscape'
  }

  var NoDataAction = Report.NoDataAction = {
    NO_PAGES: 'NoPages',
    BLANK_PAGE: 'BlankPage',
    ALL_SECTIONS_NO_DETAIL: 'AllSectionsNoDetail',
    NO_DATA_SECTIONL: 'NoDataSection'
  }

  Report.prototype.getParameters = function() {
    return this.reportDesc.parameters;
  }

  var DataSet = function(array) {
    var nextIndex = 0;
    return {
      next: function() {
        return nextIndex < array.length ?
          { value: array[nextIndex++], done: false} :
          { done: true };
      }
    }
  }

  JSReports.Report = Report;

  JSReports.version = '0.0.0';

  return JSReports;

})); 
