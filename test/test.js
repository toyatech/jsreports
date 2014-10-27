var assert = require('assert')
  , jsreports = require('../jsreports');

describe('Report', function() {

  describe('when defined', function() {

    var report;

    describe('without options', function() {

      var report = new jsreports.Report;

      it('should have default values', function() {
        assert.equal(report.get('name'), 'MyReport');
        assert.equal(report.get('columnCount'), 1);
        assert.equal(report.get('columnFillOrder'), 'Vertical');
        assert.equal(report.get('columnFillDirection'), 'LeftToRight');
        assert.equal(report.get('pageWidth'), 595);
        assert.equal(report.get('pageHeight'), 842);
        assert.equal(report.get('pageOrientation'), 'Portrait');
        assert.equal(report.get('columnWidth'), 555);
        assert.equal(report.get('columnSpacing'), 0);
        assert.equal(report.get('leftMargin'), 20);
        assert.equal(report.get('rightMargin'), 20);
        assert.equal(report.get('topMargin'), 30);
        assert.equal(report.get('bottomMargin'), 30);
        assert.equal(report.get('newTitlePage'), false);
        assert.equal(report.get('newSummaryPage'), false);
        assert.equal(report.get('summaryPageHeaderAndFooter'), false);
        assert.equal(report.get('floatColumnFooter'), false);
        assert.equal(report.get('ignorePagination'), false);
      })
    })

    describe('with options', function() {

      var report = new jsreports.Report({
        name: 'FirstReport',
      });

      it('should have defined values', function() {
        assert.equal(report.get('name'), 'FirstReport');
      })
    })

  })
})
