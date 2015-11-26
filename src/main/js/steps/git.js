/**
 * Basic git step.
 */

var renderTemplate = require('./template').renderTemplate;
var $ = require('bootstrap-detached').getBootstrap();


module.exports = {
    description: "Clone a git repository",        
    renderEditor : function(stepInfo, actionId) {      
      // provide a form to edit
      var template = '<div class="form-group">' +
                      '<label for="{{actionId}}_url">Git repository to clone</label>' +
                      '<input id="{{actionId}}_url" type="text" class="form-control" placeholder="git@github.com:cloudbees/sample.git" value="{{url}}">' +                      
                      '</div>' +
                      '<div class="form-group">' +
                        '<label for="{{actionId}}_stepName">Step name</label>' +
                        '<input id="{{actionId}}_stepName" type="text" class="form-control" placeholder="Git clone" value="{{name}}">' +
                      '</div>' +
                    '</div>';        
      
      return renderTemplate(template, stepInfo, { "actionId" : actionId });      
    },
    
    readChanges : function(actionId, currentStep) {
      // read the changes from the form and apply them. 
      // if it all checks out, return true, otherwise don't apply them, and return false. 
      currentStep.name = $('#' + actionId + "_stepName").val();
      currentStep.url = $('#' + actionId + "_url").val();
      return true; //this will cause pipeline view to be re-rendered.
    },
    
    generateScript : function(stepInfo){
      return 'git ' + stepInfo.url;
    },
};
