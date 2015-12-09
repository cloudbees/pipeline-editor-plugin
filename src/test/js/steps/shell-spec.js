
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


      it('should handle no command', function (done) {
        jsTest.onPage(function() {
          var sh = jsTest.requireSrcModule("steps/shell");
          assert.equal("// no command set for step", sh.generateScript({}));          
          done();
        });
      });   
      
      
      it('should have default empty shell command', function (done) {
        jsTest.onPage(function() {
          var sh = jsTest.requireSrcModule("steps/shell");
          var block = sh.renderEditor({}, "1234");
          expect(block.indexOf("{{command}}")).toBe(-1);          
          done();
        });
      });    

      
    }); 
