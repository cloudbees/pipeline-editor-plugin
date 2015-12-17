var renderTemplate = require('./template').renderTemplate;
var $ = require('bootstrap-detached').getBootstrap();

module.exports = {
    description: "Set an environment variable",        
    
    renderEditor : function(stepInfo, actionId) {          
      // provide a form to edit
      var template = '<div class="form-group">' +
                      '<label for="{{actionId}}_envName">Variable Name</label>' +
                      '<input type="text" id="{{actionId}}_envName" class="form-control" style="font-family:monospace;" value="{{envName}}">' +
                      '<label for="{{actionId}}_envValue">Variable Value</label>' +
                      '<input type="text" id="{{actionId}}_envValue" class="form-control" style="font-family:monospace;" value="{{envValue}}">' +
                      '<p class="help-block">Environment variable will be available for subsequent steps.</p>' +
                      '</div>' +
                      '<div class="form-group">' +
                        '<label for="{{actionId}}_stepName">Step name</label>' +
                        '<input id="{{actionId}}_stepName" type="text" class="form-control" placeholder="Set an env variable" value="{{name}}">' +
                      '</div>' +
                    '</div>';      
        
        var info = $.extend({"envValue" : ""}, stepInfo);
        info = $.extend({"envName" : ""}, info);
        return renderTemplate(template, info, { "actionId" : actionId });      
    },
    
    readChanges : function(actionId, currentStep) {
      // read the changes from the form and apply them. 
      // if it all checks out, return true, otherwise don't apply them, and return false. 
      currentStep.name = $('#' + actionId + "_stepName").val();
      currentStep.envValue = $('#' + actionId + "_envValue").val();
      currentStep.envName = $('#' + actionId + "_envName").val();
      return true; //this will cause pipeline view to be re-rendered.
    },
    
    generateScript : function(stepInfo){
      if (stepInfo.envValue && stepInfo.envName && stepInfo.envName !== '') {
          return "env." + stepInfo.envName + " = '" + stepInfo.envValue + "'";
      } else {
          return "// no environment name or variable set for step " + stepInfo.name;
      }
      
    },
};
