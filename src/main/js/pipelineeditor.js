var $ = require('bootstrap-detached').getBootstrap();
var h = require('./hello');

$(document).ready(function () {    

  //h.yeah();

  var script = $("input[name='_.script']");
  var json = $("input[name='_.json']");
  var confEditor = $('#page-body > div');
  var pageBody = $('#page-body');
  
  window.mic = $; //For debugging!
  
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
                  bootstrap() + "<div class='bootstrap-3'>" +
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
  
  h.drawPipeline();
  
  script.val("yeah");

}

/**
 * As we clear the page body, we can add our own bootstrap. 
 */
function bootstrap() {
  return '<link id="pipeline-strapstyle" rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css" ></link>';
}

function pipelineEditorArea() {
  return '<div class="container stage-listing">          ' +
    '<div id="pipeline-row" class="row"></div>        ' +
   '</div>';
}


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
