var renderTemplate = require('./template').renderTemplate;
var $ = require('bootstrap-detached').getBootstrap();

module.exports = {
    description: "Jenkins Workflow script",        
    
    renderEditor : function(stepInfo, actionId) {          
      // provide a form to edit
      var template = '<div class="form-group">' +
                      '<label for="{{actionId}}_command">Workflow Script</label>' +
                      '<textarea id="{{actionId}}_command" class="form-control" rows=5 style="font-family:monospace;">{{scriptSnippet}}</textarea>' +
                      '<p class="help-block">Run any Jenkins Workflow script.</p>' +
                      '</div>' +
                      '<div class="form-group">' +
                        '<label for="{{actionId}}_stepName">Step name</label>' +
                        '<input id="{{actionId}}_stepName" type="text" class="form-control" placeholder="Run a Jenkins Workflow script snippet" value="{{name}}">' +
                      '</div>' +
                    '</div>';      
        
        var info = $.extend({"scriptSnippet" : ""}, stepInfo);
        return renderTemplate(template, info, { "actionId" : actionId });      
    },
    
    /** return true if this should happen outside of a node block in the generated script */
    isTopLevel : function(/* stepInfo */) {
      return true;
    },

    
    readChanges : function(actionId, currentStep) {
      // read the changes from the form and apply them. 
      // if it all checks out, return true, otherwise don't apply them, and return false. 
      currentStep.name = $('#' + actionId + "_stepName").val();
      currentStep.scriptSnippet = $('#' + actionId + "_command").val();
      return true; //this will cause pipeline view to be re-rendered.
    },
    
    generateScript : function(stepInfo){
      if (stepInfo.scriptSnippet) {
          return stepInfo.scriptSnippet;
      } else {
         return '// no workflow script set for step';
      }
      
    },
};
