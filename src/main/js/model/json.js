/**
 * Load the json from the json field, if its a new job lets apply a default.
 */
exports.loadModelOrUseDefault = function(jsonText) {
  
  if (jsonText !== null && jsonText !== "") {
    var pipelineParsed = JSON.parse(jsonText);
    return pipelineParsed;
  } else {
    console.log("No pipeline has been saved, applying a sample template");
    return simpleSample;
  }    
};

/* some sample json starting points to default to */

var simpleSample = [
  {
    "name" : "Checkout and Build",
    "steps" : [
      {"type": "git", "name" : "Clone webapp", "url" : "git@github.com/thing/awesome.git"},
      {"type": "sh", "name" : "Build", "command" : "make && make install"},
    ]    
  },
  
  {
    "name" : "Test",
    "streams" : [
      {"name" : "Unit", "steps" : [
        {"type": "sh", "name" : "Run unit test suit", "command" : "/bin/ci/test"},
        {"type": "stash", "name" : "Stash results", "includes": "/test-reports", "excludes" : ""} 
      ]},
      {"name" : "Integration","steps" : [
        {"type": "sh", "name" : "Run slower tests", "command" : "/bin/ci/integration-tests"}        
      ]}
    ]    
  },
  
  {
    "name" : "Deploy",
    "steps" : [
      {"type": "sh", "name" : "Deploy to staging", "command" : "/bin/ci/deploy staging"},
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
