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

  JSReports.Report = function(reportDesc, options) {
    
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

  return JSReports;

})); 
