var assert = require('assert')
  , fs = require('fs')
  , jrxml2json = require('../jrxml2json');

describe('jrxml2json', function() {

  describe('.convert()', function() {

    describe('FirstJasper.jrxml', function() {

      var xml = "";

      before(function(done) {
        fs.readFile(__dirname + '/fixtures/FirstJasper.jrxml', function(err, data) {
          if (!err) {
            xml = data.toString();
            done();
          } else {
            assert.ifError(err);
          }
        })
      })

      it('should produce a JSReport object', function(done) {
        var obj = jrxml2json.convert(xml);
        assert.equal(obj.name, 'FirstJasper');
        done();
      })

    })

  })
})
