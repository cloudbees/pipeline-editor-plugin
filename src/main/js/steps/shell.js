var renderTemplate = require('./template').renderTemplate;
var $ = require('bootstrap-detached').getBootstrap();

module.exports = {
    description: "Run a shell script",        
    
    renderEditor : function(stepInfo, actionId) {          
      // provide a form to edit
      var template = '<div class="form-group">' +
                      '<label for="{{actionId}}_command">Command</label>' +
                      '<textarea id="{{actionId}}_command" class="form-control" rows=5 style="font-family:monospace;">{{command}}</textarea>' +
                      '<p class="help-block">Run a command in the currently allocated build server. All standard shell scripting commands apply.</p>' +
                      '</div>' +
                      '<div class="form-group">' +
                        '<label for="{{actionId}}_stepName">Step name</label>' +
                        '<input id="{{actionId}}_stepName" type="text" class="form-control" placeholder="Run a shell command" value="{{name}}">' +
                      '</div>' +
                    '</div>';      
        
        var info = $.extend({"command" : ""}, stepInfo);
        return renderTemplate(template, info, { "actionId" : actionId });      
    },
    
    readChanges : function(actionId, currentStep) {
      // read the changes from the form and apply them. 
      // if it all checks out, return true, otherwise don't apply them, and return false. 
      currentStep.name = $('#' + actionId + "_stepName").val();
      currentStep.command = $('#' + actionId + "_command").val();
      return true; //this will cause pipeline view to be re-rendered.
    },
    
    generateScript : function(stepInfo){
      if (stepInfo.command) {
          return 'sh \'' + stepInfo.command.replace(/'/g, "\\'") + '\'';
      } else {
         return '// no command set for step';
      }
      
    },
};
