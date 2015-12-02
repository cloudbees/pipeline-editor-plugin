var wf = require("../../main/js/model/workflow");
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
    assert.notEqual(-1, script.indexOf("git 'git@thing.com/yeah'"));
        
  }); 


});   

describe('Add steps to stages', function() {
    it('should work out coordinates correctly from stageId', function() {
        assert.deepEqual([0], wf.stageIdToCoordinates("stage-0"));
        assert.deepEqual([1,0], wf.stageIdToCoordinates("stage-1-0"));
    });
    
    it('should insert into non parallel stage', function() {
        var pipe = [        
          {
            "name" : "Do It",
            "steps" : []
          }
        ];  
        assert.equal(0, pipe[0].steps.length);
        var newStep = {"type" : "sh", "command" :"x", "name": "foo"};
        var resultActionId = wf.insertStep(pipe, "stage-0", newStep);
        assert.equal("stage-0-0", resultActionId);
        assert.equal(1, pipe[0].steps.length);
        assert.deepEqual(newStep, pipe[0].steps[0]); 
        
        assert.equal("stage-0-1", wf.insertStep(pipe, "stage-0", newStep));       
    });
    
    it('should insert into parallel stage', function() {
        var pipe = [        
          {
            "name" : "first stage"          
          },
          {
            "name" : "Do It",
            "streams" : [
              {"name" : "Unit", "steps" : [
                  {"type": "sh", "name" : "Run unit test suit", "command" : "/bin/ci/test"},                
                ]
              }
            ]    
          }
        ];  
        assert.equal(1, pipe[1].streams[0].steps.length);
        var newStep = {"type" : "sh", "command" :"x", "name": "foo"};
        var resultActionId = wf.insertStep(pipe, "stage-1-0", newStep);
        assert.equal("stage-1-0-1", resultActionId);
        assert.equal(2, pipe[1].streams[0].steps.length);
    });
    
    
    
});
