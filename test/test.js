var assert = require('assert')
  , jsreports = require('../');

describe('Report', function() {

  describe('when defined', function() {

    var report;

    describe('without options', function() {

      var report = new jsreports.Report;

      it('should have default values', function() {
        assert.equal(report.name, 'Report');
        assert.equal(report.columnCount, 1);
        assert.equal(report.columnFillOrder, 'Vertical');
        assert.equal(report.columnFillDirection, 'LeftToRight');
        assert.equal(report.pageWidth, 595);
        assert.equal(report.pageHeight, 842);
        assert.equal(report.pageOrientation, 'Portrait');
        assert.equal(report.columnWidth, 555);
        assert.equal(report.columnSpacing, 0);
        assert.equal(report.leftMargin, 20);
        assert.equal(report.rightMargin, 20);
        assert.equal(report.topMargin, 30);
        assert.equal(report.bottomMargin, 30);
        assert.equal(report.newTitlePage, false);
        assert.equal(report.newSummaryPage, false);
        assert.equal(report.summaryPageHeaderAndFooter, false);
        assert.equal(report.floatColumnFooter, false);
        assert.equal(report.ignorePagination, false);
      })
    })

    describe('with options', function() {

      var report = new jsreports.Report({
        name: 'FirstReport',
      });

      it('should have defined values', function() {
        assert.equal(report.name, 'FirstReport');
      })
    })

  })
})
