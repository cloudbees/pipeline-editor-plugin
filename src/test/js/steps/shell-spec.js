
var jsTest = require('jenkins-js-test');

var assert = require("assert");


describe('json storage basics', function() {  
      it('should render shell', function (done) {
        jsTest.onPage(function() {
          var sh = jsTest.requireSrcModule("steps/shell");
          assert.equal("sh 'yeah'", sh.generateScript({'command' : "yeah"}));
          done();
        });

      });      
      
      it('should escape single quotes', function (done) {
        jsTest.onPage(function() {
          var sh = jsTest.requireSrcModule("steps/shell");
          assert.equal("sh 'ye\\'ah'", sh.generateScript({'command' : "ye'ah"}));          
          done();
        });

      });      
      
    }); 
