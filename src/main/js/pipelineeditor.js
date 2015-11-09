var $ = require('bootstrap-detached').getBootstrap();

$(document).ready(function () {    

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
                  "<input id='back-to-config' type=button class='btn' value='Done'></input><span class='glyphicon glyphicon-search' aria-hidden='true'></span></div></div>");
                  
  $('#back-to-config').click(function() {      
    confEditor.show();       
    $("#pipeline-visual-editor").remove();     
    window.location.hash = "";
  });
  
  console.log(script);
  console.log(json);

}

/**
 * As we clear the page body, we can add our own bootstrap. 
 */
function bootstrap() {
  return '<link id="pipeline-strapstyle" rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css" ></link>';
}
