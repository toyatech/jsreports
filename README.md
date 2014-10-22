jsreports
=========

A JavaScript reporting library.


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
