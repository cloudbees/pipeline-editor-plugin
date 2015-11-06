var $ = require('bootstrap-detached').getBootstrap();

$(document).ready(function () {    

  var script = $("input[name='_.script']");
  var json = $("input[name='_.json']");
  var confEditor = $('#page-body > div');
  var pageBody = $('#page-body');
  
  window.mic = $; //For debugging!
  
  $('#edit-pipeline').click(function() {
    confEditor.hide();
    pageBody.append("<div id='pipeline-visual-editor'><div class='bootstrap-3'><input id='back-to-config' type=button value='OK yeah'></input><span class='glyphicon glyphicon-search' aria-hidden='true'></span></div></div>");
    $('#back-to-config').click(function() {      
      confEditor.show(); 
      $("#pipeline-visual-editor").remove();     
    });
  });
 
  console.log(script);

  console.log(json);
  
  


});
