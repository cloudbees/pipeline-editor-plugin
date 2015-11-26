
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
  
  
  it('should resolve actionId', function () {      
    assert.deepEqual([0,1,2], e.actionIdToStep("stage-0-1-2"));        
    assert.deepEqual([0,1], e.actionIdToStep("stage-0-1"));        
    assert.deepEqual([1,1], e.actionIdToStep("stage-1-1"));        
  });    


  it('should resolve actionId', function () {      
    assert.deepEqual([0,1,2], e.actionIdToStep("stage-0-1-2"));        
    assert.deepEqual([0,1], e.actionIdToStep("stage-0-1"));        
    assert.deepEqual([1,1], e.actionIdToStep("stage-1-1"));        
  });    


  it('should find the step info', function () {      
    var pipeline = [
      {
        "name" : "Checkout",
        "steps" : [
          {"name" : "Clone webapp"},
          {"name" : "Hair on fire"}  
        ]    
      },

      {
        "name" : "Prepare",
        "streams" : [
          {"name" : "Ruby", "steps" : [
              {"type": "sh", "name" : "Install Ruby", "command" : "/bin/ci/install_ruby version=2.0.1"}
            ]
          }            
        ]    
      }];
      var s1 = e.fetchStep([0,0], pipeline);
      var s2 = e.fetchStep([0,1], pipeline);  
      var s3 = e.fetchStep([1,0,0], pipeline);
      assert.equal("Clone webapp", s1.name);  
      assert.equal("Hair on fire", s2.name);  
      assert.equal("Install Ruby", s3.name);          
  });   


});
