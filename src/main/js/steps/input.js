var renderTemplate = require('./template').renderTemplate;
var $ = require('bootstrap-detached').getBootstrap();

module.exports = {
    description: "Wait for user approval",        
    
    renderEditor : function(stepInfo, actionId) {          
      // provide a form to edit
      var template = '<div class="form-group">' +
                      '<label for="{{actionId}}_question">Prompt to user</label>' +
                      '<input type="text" id="{{actionId}}_question" class="form-control" value="{{question}}">' +
                      '<p class="help-block">A short question to ask the user to let them to decide if to proceed or not.</p>' +
                      '</div>' +
                      '<div class="form-group">' +
                        '<label for="{{actionId}}_stepName">Step name</label>' +
                        '<input id="{{actionId}}_stepName" type="text" class="form-control" placeholder="Run a shell command" value="{{name}}">' +
                      '</div>' +
                    '</div>';      
        
        var info = $.extend({"question" : ""}, stepInfo);                                  
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
      currentStep.question = $('#' + actionId + "_question").val();
      return true; //this will cause pipeline view to be re-rendered.
    },
    
    generateScript : function(stepInfo){
      if (stepInfo.question) {
          return "input '" + stepInfo.question + "'";
      } else {
         return '// ' + stepInfo.name;
      }
      
    },
};
