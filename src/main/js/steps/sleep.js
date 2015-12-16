var renderTemplate = require('./template').renderTemplate;
var $ = require('bootstrap-detached').getBootstrap();

module.exports = {
    description: "Wait for a specified time",        
    
    renderEditor : function(stepInfo, actionId) {          
      // provide a form to edit
      var template = '<div class="form-group">' +
                      '<label for="{{actionId}}_seconds">How many seconds to sleep</label>' +
                      '<input type="number" id="{{actionId}}_seconds" class="form-control" value="{{sleepSeconds}}">' +
                      '<p class="help-block">Wait for the specified number of seconds.</p>' +
                      '</div>' +
                      '<div class="form-group">' +
                        '<label for="{{actionId}}_stepName">Step name</label>' +
                        '<input id="{{actionId}}_stepName" type="text" class="form-control" placeholder="Run a shell command" value="{{name}}">' +
                      '</div>' +
                    '</div>';      
        
        var info = $.extend({"sleepSeconds" : "5"}, stepInfo);
        return renderTemplate(template, info, { "actionId" : actionId });      
    },
    
    readChanges : function(actionId, currentStep) {
      // read the changes from the form and apply them. 
      // if it all checks out, return true, otherwise don't apply them, and return false. 
      currentStep.name = $('#' + actionId + "_stepName").val();
      currentStep.sleepSeconds = $('#' + actionId + "_seconds").val();
      return true; //this will cause pipeline view to be re-rendered.
    },
    
    generateScript : function(stepInfo){
      if (stepInfo.sleepSeconds) {
          return 'sleep ' + stepInfo.sleepSeconds;
      } else {
         return '// ' + stepInfo.name;
      }
      
    },
};
