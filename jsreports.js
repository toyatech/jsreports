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

  function defaults(v, r, t) {
    if (defaultValues[v]) {
      for (var k in defaultValues[v]) {
        var type = defaultValues[v][k].type;
        var defaultValue = defaultValues[v][k].defaultValue;
        var required = defaultValues[v][k].required || false;
        if (r[k]) {
          if (type === 'array') {
            if (Array.isArray(r[k])) {
              var a = [];
              for (var i = 0; i < r[k].length; i++) {
                a.push(new defaultValue(r[k][i]));
              }
              t[k] = a;
            }
          } else if (type === 'object') {
            t[k] = defaultValue(r[k]);
          } else if (typeof(type) === 'object') {
            var a = [];
            for (var i in type) {
              a.push(type[i]);
            }
            a.indexOf(r[k]) > -1 ? t[k] = r[k] : t[k] = defaultValue;
          } else {
            typeof(r[k]) === type ? t[k] = r[k] : t[k] = defaultValue;
          }
        } else {
          if (!(type === 'object')) { 
            t[k] = defaultValue;
          }
        }
      }
    }
  }

  var Report = function(reportDesc, options) {
    reportDesc = reportDesc || {};
    this.options = options || {};
    defaults('Report', reportDesc, this);
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
    NO_DATA_SECTION: 'NoDataSection'
  }
 
  var Parameter = Report.Parameter = function(parameterDesc) {
    defaults('Parameter', parameterDesc, this);
  }

  var Field = Report.Field = function(fieldDesc) {
    defaults('Field', fieldDesc, this);
  }

  var Variable = Report.Variable = function(variableDesc) {
    defaults('Variable', variableDesc, this);
  }

  var ResetType = Variable.ResetType = {
    NONE: 'None',
    REPORT: 'Report',
    PAGE: 'Page',
    COLUMN: 'Column',
    GROUP: 'Group'
  }

  var Calculation = Variable.Calculation = {
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
    defaults('Group', groupDesc, this);
  }

  var FooterPosition = Group.FooterPosition = {
    NORMAL: 'Normal',
    STACK_AT_BOTTOM: 'StackAtBottom',
    FORCE_AT_BOTTOM: 'ForceAtBottom',
    COLLATE_AT_BOTTOM: 'CollateAtBottom'
  }

  var Band = Report.Band = function(bandDesc) {
    defaults('Band', bandDesc, this);
  }

  var Style = Report.Style = function(styleDesc) {
    defaults('Style', styleDesc, this);
  }

  var defaultValues = {
    Report: {
      name: { type: 'string', required: true },
      columnCount: { type: 'number', defaultValue: 1 },
      printOrder: { type: PrintOrder, defaultValue: PrintOrder.VERTICAL },
      columnDirection: { 
        type: ColumnDirection, defaultValue: ColumnDirection.LEFT_TO_RIGHT },
      pageWidth: { type: 'number', defaultValue: 595 },
      pageHeight: { type: 'number', defaultValue: 842 },
      orientation: { type: Orientation, defaultValue: Orientation.PORTRAIT },
      noDataAction: { type: NoDataAction, defaultValue: NoDataAction.NO_PAGES },
      columnWidth: { type: 'number', defaultValue: 555 },
      columnSpacing: { type: 'number', defaultValue: 0 },    
      leftMargin: { type: 'number', defaultValue: 20 },
      rightMargin: { type: 'number', defaultValue: 20 },
      topMargin: { type: 'number', defaultValue: 30 },
      bottomMargin: { type: 'number', defaultValue: 30 },
      titleOnNewPage: { type: 'boolean', defaultValue: false },
      summaryOnNewPage: { type: 'boolean', defaultValue: false },
      summaryWithPageHeaderAndFooter: { type: 'boolean', defaultValue: false },
      floatColumnFooter: { type: 'boolean', defaultValue: false },
      ignorePagination: { type: 'boolean', defaultValue: false },
      styles: { type: 'array', defaultValue: Style },
      parameters: { type: 'array', defaultValue: Parameter },
      queryString: { type: 'string' },
      fields: { type: 'array', defaultValue: Field },
      variables: { type: 'array', defaultValue: Variable },
      groups: { type: 'array', defaultValue: Group },
      background: { type: 'object', defaultValue: Band },
      title: { type: 'object', defaultValue: Band },
      pageHeader: { type: 'object', defaultValue: Band },
      columnHeader: { type: 'object', defaultValue: Band },
      detail: { type: 'object', defaultValue: Band },
      columnFooter: { type: 'object', defaultValue: Band },
      pageFooter: { type: 'object', defaultValue: Band },
      lastPageFooter: { type: 'object', defaultValue: Band },
      summary: { type: 'object', defaultValue: Band },
      noData: { type: 'object', defaultValue: Band }
    },
    Style: {
      name: { type: 'string', required: true },
      default: { type: 'boolean', defaultValue: false },
      style: { type: 'string' },
      opacity: { type: 'number', minimum: 0.0, maximum: 1.0 },
      foregroundColor: { 
        type: 'string', match: '^#[0-9a-f]{3}([0-9a-f]{3})?$' },
      backgroundColor: { 
        type: 'string', match: '^#[0-9a-f]{3}([0-9a-f]{3})?$' },
      stroke: {}
    },
    Parameter: {
      name: { type: 'string', required: true },
      type: { type: 'string', defaultValue: 'String' },
      nestedType: { type: 'string' },
      description: { type: 'string' },
      default: { type: 'string' },
      prompt: { type: 'boolean', defaultValue: true }
    },
    Field: {
      name: { type: 'string', required: true },
      type: { type: 'string', defaultValue: 'String' },
      description: { type: 'string' }
    },
    Variable: {
      name: { type: 'string', required: true },
      type: { type: 'string', defaultValue: 'String' },
      resetType: { type: ResetType, defaultValue: ResetType.REPORT },
      resetGroup: { type: 'string' },
      incrementType: { type: ResetType, defaultValue: ResetType.NONE },
      incrementGroup: { type: 'string' },
      calculation: { type: Calculation, defaultValue: Calculation.NOTHING },
      expression: { type: 'string' },
      initialValueExpression: { type: 'string' }
    },
    Group: {
      name: { type: 'string', required: true },
      startNewColumn: { type: 'boolean', defaultValue: false },
      startNewPage: { type: 'boolean', defaultValue: false },
      resetPageNumber: { type: 'boolean', defaultValue: false },
      reprintHeaderOnEachPage: { type: 'boolean', defaultValue: false },
      minimumHeightToStartNewPage: { type: 'number', defaultValue: 0 },
      footerPosition: { 
        type: FooterPosition, defaultValue: FooterPosition.NORMAL },
      keepTogether: { type: 'boolean', defaultValue: false },
      expression: { type: 'string' },
      groupHeader: { type: 'object', defaultValue: Band },
      groupFooter: { type: 'object', defaultValue: Band }
    },
    Band: {
      height: { type: 'number', defaultValue: 0 }
    }
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
