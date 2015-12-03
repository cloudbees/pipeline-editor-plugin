
var jsTest = require('jenkins-js-test');

describe('Editor controller basics', function() {
  
  it('should show the name', function (done) {
    jsTest.onPage(function() {
      var e = jsTest.requireSrcModule("editor");
      var block = e.normalStageBlock("idvaluehere", {"name":"myname"});
      expect(block.indexOf("myname")).not.toBe(-1);
      expect(block.indexOf("idvaluehere")).not.toBe(-1);        
      done();
    });
  });
  
  it('should list steps', function (done) {
    jsTest.onPage(function() {
      var e = jsTest.requireSrcModule("editor");
      var stage = {"name" : "yeah", "steps" : [
          {"type": "git", "name" : "Clone webapp", "url" : "git@github.com/thing/awesome.git"},
          {"type": "git", "name" : "Clone webapp2", "url" : "git@github.com/thing/awesome.git"}  
        ]
        };        
      var block = e.normalStageBlock("ignore", stage);
      expect(block.indexOf("Clone webapp")).not.toBe(-1);
      expect(block.indexOf("Clone webapp2")).not.toBe(-1);      
      done();
    });
  });
  


});
