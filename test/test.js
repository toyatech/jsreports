var assert = require('assert')
  , fs = require('fs')
  , jrxml2json = require('../jrxml2json')
  , jsreports = require('../jsreports')
  , Report = jsreports.Report
  , sqlite3 = require('sqlite3').verbose();

describe('jsreports', function() {

  describe('.Report()', function() {

    describe('from FirstJasper.jrxml', function() {

      var reportDesc = {}, db;

      before(function(done) {
        fs.readFile(__dirname + '/fixtures/FirstJasper.jrxml', function(err, data) {
          if (!err) {
            reportDesc = jrxml2json.convert(data.toString());
            done();
          } else {
            assert.ifError(err);
          }
        })
      })

      before(function(done) {
        db = new sqlite3.Database(__dirname + '/fixtures/Northwind.sqlite3');
        done();
      })

      function formatMessage(k, r, s) {
        return 'Test failed for: `' + k + '`, expected: `' + s + '`, actual: `' + r + '`';
      }

      function assertEqual(k, r, s) {
        if (!(typeof(s) === 'object')) {
          assert.equal(r[k], s, formatMessage(k, r[k], s));
        } else {
          assert.equal(r[k], s[k], formatMessage(k, r[k], s[k]));
        }
      }

      it('should produce a JSReport Report object', function(done) {
        var report = new Report(reportDesc);
        assertEqual('name', report, reportDesc);
        assertEqual('columnCount', report, reportDesc);
        assertEqual('printOrder', report, Report.PrintOrder.VERTICAL);
        assertEqual('columnDirection', report, Report.ColumnDirection.LEFT_TO_RIGHT);
        assertEqual('pageWidth', report, reportDesc);
        assertEqual('pageHeight', report, reportDesc);
        assertEqual('orientation', report, Report.Orientation.PORTRAIT);
        assertEqual('noDataAction', report, Report.NoDataAction.NO_PAGES);
        assertEqual('columnWidth', report, reportDesc);
        assertEqual('columnSpacing', report, reportDesc);
        assertEqual('leftMargin', report, reportDesc);
        assertEqual('rightMargin', report, reportDesc);
        assertEqual('topMargin', report, reportDesc);
        assertEqual('bottomMargin', report, reportDesc);
        assertEqual('titleOnNewPage', report, false);
        assertEqual('summaryOnNewPage', report, false);
        assertEqual('summaryWithPageHeaderAndFooter', report, false);
        assertEqual('floatColumnFooter', report, false);
        assertEqual('ignorePagination', report, false);
        for (var i = 0; i < report.parameters.length; i++) {
          assertEqual('name', report.parameters[i], reportDesc.parameters[i]);
          assertEqual('type', report.parameters[i], reportDesc.parameters[i]);
        }
        //console.log(JSON.stringify(report, null, 2));
        done();
      })

      after(function(done) {
        db.close();
        done();
      })

    })

  })
})
