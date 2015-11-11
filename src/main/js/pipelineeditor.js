var $ = require('bootstrap-detached').getBootstrap();
var h = require('./editor');
window.mic = $; //For debugging!

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
                  "<input id='back-to-config' type=button class='btn' value='Done'></input><span class='glyphicon glyphicon-search' aria-hidden='true'></span></div></div>");
                  
  $('#back-to-config').click(function() {      
    confEditor.show();       
    $("#pipeline-visual-editor").remove();     
    window.location.hash = "";
  });
  
  console.log(script.val());
  console.log(json.val());
  
  h.initSVG();
  h.drawPipeline();
   
  script.val("yeah");

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
  '}</style>;'
}
