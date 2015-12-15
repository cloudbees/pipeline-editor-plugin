/**
 * Jenkins pipeline editor adjunct and entry point.
 */
 
var $ = require('bootstrap-detached').getBootstrap();
var h = require('./editor');
var Belay = require('./svg/svg'); 
var lines = require('./svg/lines'); 
var storage = require("./model/json");
var editors = require('./steps');
var win = require('window-handle').getWindow();

win.mic = $; //For debugging! - you can use `mic` as jquery.
win.Belay = Belay;
/* print out what editors are registered for use */
console.log(editors);

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
  if ("#pipeline-editor" === win.location.hash) {
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
  win.location.hash = "#pipeline-editor";
  pageBody.append("<div id='pipeline-visual-editor'>" +
                  "<div class='bootstrap-3'><p>" +
                  fixFlowCSS() +
                  pipelineEditorArea() +
                  detailContainer() +
                  "<div class='container'><input id='back-to-config' type=button class='btn btn-primary' value='Done'></input></div>"+
                  "</div></div>");
                  
  $('#back-to-config').click(function() {          
    $("#pipeline-visual-editor").remove();     
    win.location.hash = "";
    Belay.off();
    confEditor.show();       
    
    //remove the absolute position from the bottom sticker on return
    //otherwise the buttons may not appear until a resize. LOL (probably a better solution)
    //TODO: must be a better way.
    $('#bottom-sticker').attr('style', function(i, style) {
          return style.replace(/position[^;]+;?/g, '');
    });
    
  });
  
  
  var pipeline = storage.loadModelOrUseDefault(json.val());

  lines.initSVG();
  
  if (!storage.existingPipeline(json.val())) {
    console.log("Brand new pipeline so saving the changes the first time");
    h.writeOutChanges(pipeline, {"script" : script, "json" : json });
  } 
  
  h.drawPipeline(pipeline, {"script" : script, "json" : json });
  reJoinOnResize(pipeline);
   
}



/** The bit that holds the pipeline visualisation */
function pipelineEditorArea() {
  return '<div class="container stage-listing">' +
    '<div id="pipeline-row" class="row"></div>' +
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
                '<div id="editor-panel" class="panel-body editor-detail">' +
                    'Click on a Step to view the details. ' +
                '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
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
    lines.autoJoin(pipeline);
  });
}




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
