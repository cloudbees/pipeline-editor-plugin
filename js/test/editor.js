/**
 * Test editor functionality. Designed to be run with mocha. 
 */

setup();

var assert = require("assert");


describe('Pipeline drawing', function() {
  
      it('should render a template', function () {
        assert.equal("yeah 42 yeah", renderTemplate("yeah {{something}} yeah", {"something" : 42}));        
        assert.equal("yeah {{something}} yeah", renderTemplate("yeah {{something}} yeah", {}));        
        assert.equal("yeah 2 yeah", renderTemplate("yeah 2 yeah", {"something" : 42}));        
        assert.equal("yeah 1 2", renderTemplate("yeah {{s1}} {{s2}}", {"s1" : 1, "s2": 2}));        
        assert.equal("yeah 1 2", renderTemplate("yeah {{s1}} {{s2}}", {"s1" : 1}, {"s2": 2}));        
      });    

    it('should show the name', function () {
      var block = normalStageBlock("idvaluehere", {"name":"myname"});
      assert.notEqual(-1, block.indexOf("myname"));
      assert.notEqual(-1, block.indexOf("idvaluehere"));
    });

    it('should list steps', function () {
      var stage = {"name" : "yeah", "steps" : [
          {"type": "git", "name" : "Clone webapp", "url" : "git@github.com/thing/awesome.git"},
          {"type": "git", "name" : "Clone webapp2", "url" : "git@github.com/thing/awesome.git"}  
        ]
        };        
      var block = normalStageBlock("ignore", stage);
      assert.notEqual(-1, block.indexOf("Clone webapp"));
      assert.notEqual(-1, block.indexOf("Clone webapp2"));      
    });
    
    it('should know if parallel stage', function () {
      var stage = {"name" : "yeah", "streams" : [
          {"name" : "Clone webapp"}          
        ]
        };        
      assert.equal(true, isParallelStage(stage));      
      var stage = {"name" : "yeah", "steps" : [
          {"name" : "Clone webapp"}          
        ]
        };        
      assert.equal(false, isParallelStage(stage));  
    });
    
    it('should resolve actionId', function () {      
      assert.deepEqual([0,1,2], actionIdToStep("stage-0-1-2"));        
      assert.deepEqual([0,1], actionIdToStep("stage-0-1"));        
      assert.deepEqual([1,1], actionIdToStep("stage-1-1"));        
    });    


    it('should resolve actionId', function () {      
      assert.deepEqual([0,1,2], actionIdToStep("stage-0-1-2"));        
      assert.deepEqual([0,1], actionIdToStep("stage-0-1"));        
      assert.deepEqual([1,1], actionIdToStep("stage-1-1"));        
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
        var s1 = fetchStep([0,0], pipeline);
        var s2 = fetchStep([0,1], pipeline);  
        var s3 = fetchStep([1,0,0], pipeline);
        assert.equal("Clone webapp", s1.name);  
        assert.equal("Hair on fire", s2.name);  
        assert.equal("Install Ruby", s3.name);          
        
      
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
      
      var script = toWorkflow(pipe, editorModules);
      assert.notEqual(-1, script.indexOf("/app"));
      assert.notEqual(-1, script.indexOf("git git@thing.com/yeah"));
          
    }); 

    
});


function setup() {
  var fs = require('fs');
  var vm = require('vm');
  var path = './editor.js';
  var code = fs.readFileSync(path);
  vm.runInThisContext(code);
}
