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

  function defaults(k, r, t, d, e) {
    if (typeof(e) === 'object') {
      var a = [];
      for (var i in e) {
        a.push(e[i]);
      }
      a.indexOf(r[k]) > -1 ? t[k] = r[k] : t[k] = e[d];
    } else {
      typeof(r[k]) === typeof(d) ? t[k] = r[k] : t[k] = d;
    }
  }

  function required(k, r, t) {
    if (r[k]) {
      t[k] = r[k];
    } else {
      throw new Error(k + ' is require!');
    }
  }

  function optional(k, r, t, d, e) {
    if (r[k]) {
      if (Array.isArray(r[k])) {
        var a = [];
        for (var i = 0; i < r[k].length; i++) {
          a.push(new e(r[k][i]));
        }
        t[k] = a;
      } else {
        t[k] = defaults(k, r, t, d, e);
      }
    } 
  }

  var defaults = {
    Report: {
      name: { type: 'string', required: true },
      columnCount: { type: 'number', value: 1 },
      printOrder: { type: PrintOrder, value: PrintOrder.VERTICAL },
      columnDirection: { type: ColumnDirection, value: ColumnDirection.LEFT_TO_RIGHT },
      pageWidth: { type: 'number', value: 595 },
      pageHeight: { type: 'number', value: 842 },
      orientation: { type: Orientation, value: Orientation.PORTRAIT },
      noDataCtion: { type: NoDataAction, value: NoDataAction.NO_PAGES },
      columnWidth: { type: 'number', value: 555 },
      columnSpacing: { type: 'number', value: 0 },    
      leftMargin: { type: 'number', value: 20 },
      rightMargin: { type: 'number', value: 20 },
      topMargin: { type: 'number', value: 30 },
      bottomMargin: { type: 'number', value: 30 },
      titleOnNewPage: { type: 'boolean', value: false },
      summaryOnNewPage: { type: 'boolean', value: false },
      summaryWithPageHeaderAndFooter: { type: 'boolean', value: false },
      floatColumnFooter: { type: 'boolean', value: false },
      ignorePagination: { type: 'boolean', value: false },
      styles: { type: 'array', value: Style },
      parameters: { type: 'array', value: Parameter },
      fields: { type: 'array', value: Field },
      variables: { type: 'array', value: Variable },
      groups: { type: 'array', value: Group },
      title: { type: 'object', value: Band },
      pageHeader: { type: 'object', value: Band },
      columnHeader: { type: 'object', value: Band },
      detail: { type: 'object', value: Band },
      columnFooter: { type: 'object', value: Band },
      pageFooter: { type: 'object', value: Band },
      summary: { type: 'object', value: Band } 
    },
    Style: {
      name: { type: 'string', required: true },
      default: { type: 'boolean', value: false },
      style: { type: 'string' },
      opacity: { type: 'number', minimum: 0.0, maximum: 1.0 },
      foregroundColor: { type: 'string', match: '^#[0-9a-f]{3}([0-9a-f]{3})?$' },
      backgroundColor: { type: 'string', match: '^#[0-9a-f]{3}([0-9a-f]{3})?$' },
      stroke: {}
    }
  }
       

  var Report = function(reportDesc, options) {
    this.reportDesc = reportDesc;
    this.options = options || {};

    //optional('detail', reportDesc, this, {}, Band);
    //optional('columnFootet', reportDesc, this, {}, Band);
    //optional('pageFooter', reportDesc, this, {}, Band);
    //optional('summary', reportDesc, this, {}, Band);
  }

  var Property = Report.Property = function(propertyDesc) {
    //this.name = required(propertyDesc.name, 'name');
    //this.value = propertyDesc.value;
  }

  var Parameter = Report.Parameter = function(parameterDesc) {
    required('name', parameterDesc, this);
    defaults('type', parameterDesc, this, 'String');
    optional('nestedType', parameterDesc, this);
    optional('description', parameterDesc, this)
    optional('default', parameterDesc, this);
    optional('prompt', parameterDesc, this);
  }

  var Field = Report.Field = function(fieldDesc) {
    required('name', fieldDesc, this);
    defaults('type', fieldDesc, this, 'String');
    optional('description', fieldDesc, this);
  }

  var Variable = Report.Variable = function(variableDesc) {
    required('name', variableDesc, this);
    defaults('type', variableDesc, this, 'String');
    defaults('resetType', variableDesc, this, 'REPORT', VariableResetType);
    optional('incrementGroup', variableDesc, this);
    defaults('calculation', variableDesc, this, 'NOTHING', VariableCalculation);
    optional('expression', variableDesc, this);
    optional('initialValue', variableDesc, this);
  }

  var VariableResetType = Variable.VariableResetType = {
    NONE: 'None',
    REPORT: 'Report',
    PAGE: 'Page',
    COLUMN: 'Column',
    GROUP: 'Group'
  }

  var VariableCalculation = Variable.VariableCalculation = {
    NOTHING: 'Nothing',
    COUNT: 'Count',
    DISTINCT_COUNT: 'DistinctCount',
    SUM: 'Sum',
    AVERAGE: 'Average',
    LOWEST: 'Lowest',
    HIGHEST: 'Highest',
    STANDARD_DEVIATION: 'StandardDeviation',
    VARIANCE: 'Variance',
    SYSTEM: 'System',
    FIRST: 'First'
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
