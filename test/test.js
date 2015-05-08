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

      it('should produce a JSReport Report object', function(done) {
        var report = new Report(reportDesc);
        assert.equal(report.name, reportDesc.name, 'name');
        assert.equal(report.columnCount, reportDesc.columnCount, 'columnCount');
        assert.equal(report.printOrder, Report.PrintOrder.VERTICAL);
        assert.equal(report.columnDirection, Report.ColumnDirection.LEFT_TO_RIGHT);
        assert.equal(report.pageWidth, reportDesc.pageWidth);
        assert.equal(report.pageHeight, reportDesc.pageHeight);
        assert.equal(report.orientation, Report.Orientation.PORTRAIT);
        assert.equal(report.noDataAction, Report.NoDataAction.NO_PAGES);
        assert.equal(report.columnWidth, reportDesc.columnWidth);
        assert.equal(report.columnSpacing, reportDesc.columnSpacing);
        assert.equal(report.leftMargin, reportDesc.leftMargin);
        assert.equal(report.rightMargin, reportDesc.rightMargin);
        assert.equal(report.topMargin, reportDesc.topMargin);
        assert.equal(report.bottomMargin, reportDesc.bottomMargin);
        assert.equal(report.titleOnNewPage, false, 'titleOnNewPage');
        assert.equal(report.summaryOnNewPage, false);
        assert.equal(report.summaryWithPageHeaderAndFooter, false);
        assert.equal(report.floatColumnFooter, false);
        assert.equal(report.ignorePagination, false);
        done();
      })

      after(function(done) {
        db.close();
        done();
      })

    })

  })
})
