JSReports
=========

A JavaScript reporting library.

JSReports is modeled after two excellent open source projects:

[JasperReports](http://jaspersoft.com/jasperreports)

and

[Backbone.js](http://backbonejs.com)

JSReports is a work in progress. Following is some examples of what the syntax might look like:

JasperReport.jrxml -> jrxml2json() -> JasperReport.json

```javascript
var jsreports = require('jsreports');

var json = {...}; // JasperReport.json
var data = {...}; // report data

var report = new jsreports.Report(json, options);

report.fill(data);

report.export('pdf'); // or report.exportPDF();
report.export('html'); // or report.exportHTML();
report.export('xls'); // or report.exportXLS();
```
