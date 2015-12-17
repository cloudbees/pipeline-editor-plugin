var renderTemplate = require('./template').renderTemplate;
var $ = require('bootstrap-detached').getBootstrap();


module.exports = {
    description: "Unstash temporary artifacts",        
    renderEditor : function(stepInfo, actionId) {      
      // provide a form to edit
      var template = '<div class="form-group">' +
                      '<label for="{{actionId}}_name">Name of stash</label>' +
                      '<input id="{{actionId}}_name" type="text" class="form-control" placeholder="Build Results" value="{{name}}">' +                      
                      '<p class="help-block">This is the name that was used to temporarily stash artifacts.</p>' +
                      '</div>' +
                    '</div>';        
      
      return renderTemplate(template, stepInfo, { "actionId" : actionId });      
    },
    
    readChanges : function(actionId, currentStep) {
      // read the changes from the form and apply them. 
      // if it all checks out, return true, otherwise don't apply them, and return false. 
      currentStep.name = $('#' + actionId + "_name").val();
      return true; //this will cause pipeline view to be re-rendered.
    },
    
    generateScript : function(stepInfo){
      return 'unstash "' + stepInfo.name + '"';
    },
};
