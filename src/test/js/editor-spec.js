
var windowHandle = require('window-handle');
var jsdom = require("jsdom").jsdom;
var doc = jsdom('<html></html>');
windowHandle.setWindow(doc.defaultView); // set a fake window while we initialize. Will be reset later for each test, if needed.

var e = require("../../main/js/editor");
var assert = require("assert");


describe('Editor controller basics', function() {
  
  it('should show the name', function () {
    var block = e.normalStageBlock("idvaluehere", {"name":"myname"});
    assert.notEqual(-1, block.indexOf("myname"));
    assert.notEqual(-1, block.indexOf("idvaluehere"));
  });
  
  it('should list steps', function () {
    var stage = {"name" : "yeah", "steps" : [
        {"type": "git", "name" : "Clone webapp", "url" : "git@github.com/thing/awesome.git"},
        {"type": "git", "name" : "Clone webapp2", "url" : "git@github.com/thing/awesome.git"}  
      ]
      };        
    var block = e.normalStageBlock("ignore", stage);
    assert.notEqual(-1, block.indexOf("Clone webapp"));
    assert.notEqual(-1, block.indexOf("Clone webapp2"));      
  });
  


});
