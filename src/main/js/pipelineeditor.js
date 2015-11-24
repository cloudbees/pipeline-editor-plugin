/**
 * Jenkins pipeline editor adjunct and entry point.
 */
 
var $ = require('bootstrap-detached').getBootstrap();
var h = require('./editor');
var Belay = require('./svg'); 

window.mic = $; //For debugging!

/** 
 * Hook in to the edit button on the regular jenkins job config screen 
 * There may need to be changes here to do the equivalent of Behaviour js-Prototype code.
 * (scroll down the bottom to see the original code concept).
 *
 * Get both the script and the json text that is stored in config.xml
 */
$(document).ready(function () {    
  var script = $("input[name='_.script']");
  var json = $("input[name='_.json']");
  var confEditor = $('#page-body > div');
  var pageBody = $('#page-body');
  if ("#pipeline-editor" === window.location.hash) {
    showEditor($, confEditor, pageBody, script, json);
  }
  $('#edit-pipeline').click(function() {
    showEditor($, confEditor, pageBody, script, json);
  });
});

/**
 * Clear the regular jenkins conf editor, show the pipeline editor
 */ 
function showEditor($, confEditor, pageBody, script, json) {
  confEditor.hide();    
  window.location.hash = "#pipeline-editor";
  pageBody.append("<div id='pipeline-visual-editor'>" +
                  "<div class='bootstrap-3'><p>" +
                  fixFlowCSS() +
                  pipelineEditorArea() +
                  detailContainer() +
                  "<div class='container'><input id='back-to-config' type=button class='btn btn-primary' value='Done'></input></div>"+
                  "</div></div>");
                  
  $('#back-to-config').click(function() {      
    confEditor.show();       
    $("#pipeline-visual-editor").remove();     
    window.location.hash = "";
    Belay.off();
  });
  
  var pipeline = loadModelOrUseDefault(json.val());

  h.initSVG();
  h.drawPipeline(pipeline, {"script" : script, "json" : json });
  reJoinOnResize(pipeline);
   
 
}

/**
 * Load the json from the json field, if its a new job lets apply a default.
 */
function loadModelOrUseDefault(jsonText) {
  if (jsonText !== "") {
    var pipelineParsed = JSON.parse(jsonText);
    return pipelineParsed;
  } else {
    return samplePipeline;
  }    
}


/** The bit that holds the pipeline visualisation */
function pipelineEditorArea() {
  return '<div class="container stage-listing">          ' +
    '<div id="pipeline-row" class="row"></div>        ' +
   '</div>';
}


/** container for holding the specific editors depending on what is clicked */
function detailContainer() {
  return '<div class="container stage-detail">' +
    '<div class="row">' +
      '<h3 class="col-md-12" id="editor-heading"></h3>' +
      '<div class="row">' +
        '<div class="col-md-12">' +
          '<div class="panel panel-default">' +
                '<div id="editor-panel" class="panel-body editor-detail"> ' +
                    'Click on a Step to view the details. ' +
                '</div>' +
          '</div>              ' +
        '</div>              ' +
      '</div>' +
    '</div>    ' +
  '</div>';
}

/** 
 * This will fix a problem with wrapping elements in bootstrap 
 * this is documented here: http://stackoverflow.com/questions/25598728/irregular-bootstrap-column-wrapping 
 * Without this, things won't wrap clearly left to right. Read it. 
 */
function fixFlowCSS() {
  return '<style>.stage-listing > .row > .col-md-3:nth-child(4n+1) {' +
    'clear: both;' +
  '}</style>';
}

/**
 * As svg lines are overlayed based on positions of divs, when the divs move around
 * the lines need to be redrawn.
 */
function reJoinOnResize(pipeline) {
  $(window).resize(function(){            
    h.autoJoin(pipeline);
  });
}


var samplePipeline = 
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

/**
 * Originally we used this prototype snipped to create the edit button and clear
 * doens't play nice with the new stuff, but kept here for reference as 
 * some of the behaviour stuff may need to be retrofitted to the jquery based code.
 * Behaviour.specify("INPUT.pipeline-editor", 'pipeline-editor-button', 0, function(e) {
         var script = e.next("input");
         var json = script.next("input");

         makeButton(e,function(_) {
             var pageBody = $('page-body');
             var row = pageBody.down(".row");

             row.style.display = "none";

             pageBody.insert({bottom:"<div class=pipeline-editor style='padding:3em'><b>pipeline-editor</b><input type=button name=accept value=Accept></div>"});

             var canvas = pageBody.down("> .pipeline-editor");
             var accept = canvas.down("> INPUT");

             makeButton(accept,function(_){
                 // update fhe form values
                 script.value = "...";
                 json.value = "...";

                 // kill the dialog
                 canvas.remove();
                 row.style.display = "block";
             });
         });
 });
 */
