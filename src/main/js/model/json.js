/**
 * The json model of the data: 
 * pipeline is a [list of stages]
 * each stage is an object that is either an ordinary stage, or a parallel stage.
 * (this is not a workflow script concept, just a model abstraction here).
 * 
 * An ordinary stage: { "name" : for display purposes and logging, "steps" : [list of steps]}
 * a step: { "name" : for display purposes only, "type" : determines what editor is loaded. }
 * 
 * A parallel stage: { "name": ..., "streams" : [list streams] }
 *  A "stream" is sometimes called a "branch" in workflow examples, but this is confusing with SCM branches, 
 *  so I have called it a stream. 
 *  A stream is similar to a stage, { "name" : ... , "steps" : [list of steps]} containing steps.
 *  The name of the stream is used in logs, and for display, however it is all under the one 
 *  workflow "stage". 
 * 
 * See the samples below to make this more concrete.
 */

/**
 * Load the json from the json field, if its a new job lets apply a default.
 */
exports.loadModelOrUseDefault = function(jsonText) {  
  if (exports.existingPipeline(jsonText)) {
    var pipelineParsed = JSON.parse(jsonText);
    return pipelineParsed;
  } else {
    console.log("No pipeline has been saved, applying a sample template");
    return simpleSample;
  }    
};

/** if not valid json then we need to resort to a sample */
exports.existingPipeline = function(jsonText) {
  return jsonText !== null && jsonText !== "";
};

/* some sample json starting points to default to */

var simpleSample = [
  {
    "name" : "Checkout and Build",
    "steps" : [
      {"type": "git", "name" : "Clone webapp", "url" : "https://github.com/michaelneale/sample-pipeline-project.git"},
      {"type": "sh", "name" : "Build", "command" : "echo 'hello world'"}
    ]    
  },
  
  {
    "name" : "Test",
    "streams" : [
      {"name" : "Unit", "steps" : [
        {"type": "sh", "name" : "Run unit test suite", "command" : "./bin/ci/test"}
      ]},
      {"name" : "Integration","steps" : [
        {"type": "sh", "name" : "Run slower tests", "command" : "./bin/ci/integration-tests"}        
      ]}
    ]    
  },
  
  {
    "name" : "Deploy",
    "steps" : [
      {"type": "sh", "name" : "Deploy to staging", "command" : "./bin/ci/deploy"},
    ]    
  }
  
  
];
exports.simpleSample = simpleSample;


exports.complexSample = 
[
  {
    "name" : "Checkout",
    "steps" : [
      {"type": "git", "name" : "Clone webapp", "url" : "git@github.com/thing/awesome.git"},
    ]    
  },
  
  
  {
    "name" : "Prepare Test Database",
    "steps" : [
      {"type": "sh", "name" : "Install Postgress", "command" : "install_postgres"},
      {"type": "sh", "name" : "Initialise DB", "command" : "pgsql data/init.sql"},
    ]    
  },
  
  
 
  {
    "name" : "Prepare",
    "streams" : [
      {"name" : "Ruby", "steps" : [
        {"type": "sh", "name" : "Install Ruby", "command" : "/bin/ci/install_ruby version=2.0.1"},
        {"type": "stash", "name" : "Stash compiled app", "includes": "/app", "excludes" : ""} 
      ]},
      {"name" : "Python","steps" : [
        {"type": "sh", "name" : "Yeah", "command" : "exit()"}
        
      ]}
    ]    
  },
  
  {
    "name" : "Stage and Test",
    "steps" : []    
  },
  
  {
    "name" : "Approve",
    "steps" : [],
    "type" : "input"    
  },
  
  {
    "name" : "Deploy",
    "steps" : [],
    "node" : "devops-production"    
  },
  
  {
    "name" : "Party",
    "steps" : [{"type": "rick", "name" : "Awesome" } ]    
  }

  
];
