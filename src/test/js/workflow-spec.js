var wf = require("../../main/js/storage/workflow");
var assert = require("assert");

var windowHandle = require('window-handle');
var jsdom = require("jsdom").jsdom;
var doc = jsdom('<html></html>');
windowHandle.setWindow(doc.defaultView); // set a fake window while we initialize. Will be reset later for each test, if needed.

describe('Workflow rendering', function() {  
  
  it('should know if parallel stage', function () {
    var stage = {"name" : "yeah", "streams" : [
        {"name" : "Clone webapp"}          
      ]
      };        
    assert.equal(true, wf.isParallelStage(stage));      
    stage = {"name" : "yeah", "steps" : [
        {"name" : "Clone webapp"}          
      ]
      };        
    assert.equal(false, wf.isParallelStage(stage));  
  });


  it('should render script', function() {
    var pipe = [        
      {
        "name" : "Prepare",
        "streams" : [
            {"name" : "Ruby", "steps" : [
              {"type": "sh", "name" : "Install Ruby", "command" : "/bin/ci/install_ruby version=2.0.1"},
              {"type": "stash", "name" : "Stash compiled app", "includes": "/app", "excludes" : ""} 
            ]},
            {"name" : "Python","steps" : [
              {"type": "sh", "name" : "Yeah", "command" : "exit()"},
              
            ]}
          ]
      }, 
      {
        "name" : "Do It",
        "steps" : [
          {"type": "git", "url" : "git@thing.com/yeah"}
        ]
      }
    ];  
    
    var editorModules = require('../../main/js/steps/all').all;
    
    var script = wf.toWorkflow(pipe, editorModules);
    assert.notEqual(-1, script.indexOf("/app"));
    assert.notEqual(-1, script.indexOf("git git@thing.com/yeah"));
        
  }); 


});   
