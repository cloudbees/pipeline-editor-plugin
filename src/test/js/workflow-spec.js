var jsTest = require('jenkins-js-test');
var assert = require("assert");

describe('Workflow rendering', function() {  
  
  it('should know if parallel stage', function (done) {
    jsTest.onPage(function() {
        var wf = jsTest.requireSrcModule("model/workflow");
        var stage = {"name": "yeah", "streams": [
            {"name": "Clone webapp"}
        ]
        };
        assert.equal(true, wf.isParallelStage(stage));
        stage = {"name": "yeah", "steps": [
            {"name": "Clone webapp"}
        ]
        };
        assert.equal(false, wf.isParallelStage(stage));
        done();
    });
  });


  it('should render script', function(done) {
    jsTest.onPage(function() {
        var wf = jsTest.requireSrcModule("model/workflow");
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
        
        var editorModules = jsTest.requireSrcModule('steps');
        
        var script = wf.toWorkflow(pipe, editorModules);
        assert.notEqual(-1, script.indexOf("/app"));
        assert.notEqual(-1, script.indexOf("git 'git@thing.com/yeah'"));
        done();
    });        
  }); 


});   

describe('Add steps to stages', function() {
    it('should work out coordinates correctly from stageId', function(done) {
        jsTest.onPage(function() {
            var wf = jsTest.requireSrcModule("model/workflow");
            assert.deepEqual([0], wf.stageIdToCoordinates("stage-0"));
            assert.deepEqual([1,0], wf.stageIdToCoordinates("stage-1-0"));
            done();
        });
    });
    
    it('should insert into non parallel stage', function(done) {
        jsTest.onPage(function() {
            var wf = jsTest.requireSrcModule("model/workflow");
            var pipe = [        
              {
                "name" : "Do It",
                "steps" : []
              }
            ];  
            assert.equal(0, pipe[0].steps.length);
            var newStep = {"type" : "sh", "command" :"x", "name": "foo"};
            var insertResult = wf.insertStep(pipe, "stage-0", newStep);
            assert.equal("stage-0-0", insertResult.actionId);
            assert.equal(1, pipe[0].steps.length);
            assert.deepEqual(newStep, pipe[0].steps[0]); 
            
            assert.equal("stage-0-1", wf.insertStep(pipe, "stage-0", newStep).actionId);
            done();
        });
    });
    
    it('should insert into parallel stage', function(done) {
        jsTest.onPage(function() {
            var wf = jsTest.requireSrcModule("model/workflow");
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
            var insertResult = wf.insertStep(pipe, "stage-1-0", newStep);
            assert.equal("stage-1-0-1", insertResult.actionId);
            assert.equal(2, pipe[1].streams[0].steps.length);
            done();
        });
    });
    
    
    
});

describe('Find things in the pipeline array', function() {
  it('should resolve actionId', function (done) {      
    jsTest.onPage(function() {
        var wf = jsTest.requireSrcModule("model/workflow");
        assert.deepEqual([0,1,2], wf.actionIdToStep("stage-0-1-2"));        
        assert.deepEqual([0,1], wf.actionIdToStep("stage-0-1"));        
        assert.deepEqual([1,1], wf.actionIdToStep("stage-1-1"));
        done();
    });
  });    


  it('should resolve actionId', function (done) {      
    jsTest.onPage(function() {
        var wf = jsTest.requireSrcModule("model/workflow");
        assert.deepEqual([0,1,2], wf.actionIdToStep("stage-0-1-2"));        
        assert.deepEqual([0,1], wf.actionIdToStep("stage-0-1"));        
        assert.deepEqual([1,1], wf.actionIdToStep("stage-1-1"));
        done();
    });
  });    


  it('should find the step info', function (done) {      
    jsTest.onPage(function() {
        var wf = jsTest.requireSrcModule("model/workflow");
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
        var s1 = wf.fetchStep([0,0], pipeline);
        var s2 = wf.fetchStep([0,1], pipeline);  
        var s3 = wf.fetchStep([1,0,0], pipeline);
        assert.equal("Clone webapp", s1.name);  
        assert.equal("Hair on fire", s2.name);  
        assert.equal("Install Ruby", s3.name);
        done();
    });
  });  
  
  it('should combine parallel to regular', function(done) {
    jsTest.onPage(function() {
      var wf = jsTest.requireSrcModule("model/workflow");
      var pipeline = [
        {
        "name" : "Prepare",
        "streams" : [
          {"name" : "Ruby", "steps" : [
              {"type": "sh", "name" : "Install Ruby", "command" : "/bin/ci/install_ruby version=2.0.1"}
            ]
          },            
          {"name" : "Ruby", "steps" : [
              {"type": "git", "name" : "Another thing", "command" : "/bin/ci/install_ruby version=2.0.1"}
            ]
          }           
         ]    
        }
      ];
      
      wf.parallelToNormal(pipeline, "stage-0");
      
      var stage = pipeline[0];
      assert.equal(2, stage.steps.length);
      assert.equal(undefined, stage.streams);
      
      assert.equal('sh', pipeline[0].steps[0].type);
      assert.equal('Install Ruby', pipeline[0].steps[0].name);
      
      done();
    });
    
  });
  
  it('should remove a step from the pipeline', function(done) {
    jsTest.onPage(function() {
      var wf = jsTest.requireSrcModule("model/workflow");
      var pipeline = [
        {
        "name" : "Prepare",
        "steps" : [          
              {"type": "sh", "name" : "Install Ruby", "command" : "/bin/ci/install_ruby version=2.0.1"},          
              {"type": "git", "name" : "Another thing", "command" : "/bin/ci/install_ruby version=2.0.1"}
          ]    
        }
      ];
      assert.equal(2, pipeline[0].steps.length);
      wf.removeActionId(pipeline, "stage-0-0"); 
      assert.equal(1, pipeline[0].steps.length);     
      var expect = {"type": "git", "name" : "Another thing", "command" : "/bin/ci/install_ruby version=2.0.1"};
      assert.deepEqual([expect], pipeline[0].steps);
      
      pipeline = [
        {
        "name" : "Prepare",
        "streams" : [
          {"name" : "Ruby", "steps" : [
              {"type": "sh", "name" : "Install Ruby", "command" : "/bin/ci/install_ruby version=2.0.1"}
            ]
          },            
          {"name" : "Ruby", "steps" : [
              {"type": "git", "name" : "Another thing", "command" : "/bin/ci/install_ruby version=2.0.1"}
            ]
          }           
         ]    
        }
      ];
      
      assert.equal(1, pipeline[0].streams[0].steps.length);       
      wf.removeActionId(pipeline, "stage-0-0-0"); 
      assert.equal(0, pipeline[0].streams[0].steps.length);     
      
      
      done();
    });
  });
  
  it('should remove a stage from the pipeline', function(done) {
    jsTest.onPage(function() {
      var wf = jsTest.requireSrcModule("model/workflow");
      var pipeline = [
        {
        "name" : "Prepare",
        "steps" : [          
              {"type": "sh", "name" : "Install Ruby", "command" : "/bin/ci/install_ruby version=2.0.1"},          
              {"type": "git", "name" : "Another thing", "command" : "/bin/ci/install_ruby version=2.0.1"}
          ]    
        }
      ];
      wf.removeStage(pipeline, "stage-0"); 
      assert.equal(0, pipeline.length);
      
      pipeline = [
        {
        "name" : "Prepare",
        "streams" : [
          {"name" : "Ruby", "steps" : [
              {"type": "sh", "name" : "Install Ruby", "command" : "/bin/ci/install_ruby version=2.0.1"}
            ]
          },            
          {"name" : "Ruby", "steps" : [
              {"type": "git", "name" : "Another thing", "command" : "/bin/ci/install_ruby version=2.0.1"}
            ]
          }           
         ]    
        }
      ];
      
      
      assert.equal(2, pipeline[0].streams.length);     
      wf.removeStage(pipeline, "stage-0-0");      
      assert.equal(1, pipeline[0].streams.length);     
      
      done();
    });
  });
  
  it('should convert to parallel automatically and toggle', function(done) {
    jsTest.onPage(function() {
      var wf = jsTest.requireSrcModule("model/workflow");
      var pipeline = [
        {
        "name" : "Prepare",
        "steps" : [          
              {"type": "sh", "name" : "Install Ruby", "command" : "/bin/ci/install_ruby version=2.0.1"},          
              {"type": "git", "name" : "Another thing", "command" : "/bin/ci/install_ruby version=2.0.1"}
          ]    
        }
      ];
      
      wf.makeParallel(pipeline, "stage-0");
      
      var stage = pipeline[0];
      assert.equal(undefined, stage.steps);
      assert.equal(2, stage.streams.length);
      
      assert.equal("Install Ruby", stage.streams[0].name);
      assert.equal("Install Ruby", stage.streams[0].steps[0].name);

      wf.toggleParallel(pipeline, "stage-0");
      assert.equal(undefined, stage.streams);
      assert.equal(2, stage.steps.length);
      
      wf.toggleParallel(pipeline, "stage-0");
      assert.equal(undefined, stage.steps);
      assert.equal(2, stage.streams.length);

      
      done();
    });
    
  });  
  
  
  
  
});
